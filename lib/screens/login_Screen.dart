import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:app_links/app_links.dart';
import 'dart:async';
import 'phone_login_screen.dart';
import 'colors.dart';
import 'app_wrapper.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with TickerProviderStateMixin {
  final supabase = Supabase.instance.client;

  late AnimationController _fadeController;
  late AnimationController _slideController;
  late AnimationController _scaleController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _scaleAnimation;

  bool _isGoogleLoggingIn = false;

  // App Links for handling OAuth redirects
  late AppLinks _appLinks;
  StreamSubscription<Uri>? _linkSubscription;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _setupAuthListener();
    _initDeepLinks();
  }

  void _initializeAnimations() {
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.4),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.elasticOut,
    ));
    _scaleAnimation = CurvedAnimation(
      parent: _scaleController,
      curve: Curves.elasticOut,
    );

    _fadeController.forward();
    _slideController.forward();
    Future.delayed(const Duration(milliseconds: 200), () {
      _scaleController.forward();
    });
  }

  void _initDeepLinks() {
    _appLinks = AppLinks();

    _linkSubscription = _appLinks.uriLinkStream.listen(
          (Uri uri) {
        print('📱 Deep link received: $uri');
        _handleIncomingLink(uri);
      },
      onError: (err) {
        print('❌ Deep link error: $err');
      },
    );

    _appLinks.getInitialLink().then((Uri? uri) {
      if (uri != null) {
        print('📱 Initial deep link: $uri');
        _handleIncomingLink(uri);
      }
    });
  }

  void _handleIncomingLink(Uri uri) {
    print('🔗 Processing link: ${uri.toString()}');

    if (uri.scheme == 'com.yuknow.ironly' && uri.host == 'auth-callback') {
      print('✅ OAuth callback detected');

      final fragment = uri.fragment;
      if (fragment.isNotEmpty) {
        final params = Uri.splitQueryString(fragment);
        final accessToken = params['access_token'];

        if (accessToken != null) {
          print('✅ Access token found in callback');
          _handleOAuthSuccess();
        } else {
          print('❌ No access token in callback');
          _handleOAuthError('No access token received');
        }
      }
    }
  }

  void _handleOAuthSuccess() {
    setState(() {
      _isGoogleLoggingIn = false;
    });
    _showMessage('🎉 Welcome! Signing you in...', isError: false);
    print('✅ OAuth login successful');
  }

  void _handleOAuthError(String error) {
    setState(() {
      _isGoogleLoggingIn = false;
    });
    _showMessage('Google login failed: $error', isError: true);
    print('❌ OAuth error: $error');
  }

  void _setupAuthListener() {
    supabase.auth.onAuthStateChange.listen((data) {
      final AuthChangeEvent event = data.event;
      final Session? session = data.session;

      print('🔐 Auth event: $event');
      print('🔐 Session exists: ${session != null}');
      print('🔐 User: ${session?.user?.email ?? session?.user?.phone}');

      if (event == AuthChangeEvent.signedIn && session != null) {
        if (mounted) {
          setState(() {
            _isGoogleLoggingIn = false;
          });

          // Vibration feedback for success
          HapticFeedback.lightImpact();

          String userName = session.user.email?.split('@')[0] ??
              session.user.phone?.replaceAll('+91', '') ?? 'User';

          _showMessage('🎉 Welcome back, $userName!', isError: false);
          print('✅ Login successful');

          // Navigate to AppWrapper after a brief delay
          Future.delayed(const Duration(milliseconds: 1500), () {
            if (mounted) {
              // ✅ NAVIGATE TO APP WRAPPER - NOT DIRECTLY TO HOME
              Navigator.pushAndRemoveUntil(
                context,
                MaterialPageRoute(builder: (_) => const AppWrapper()),
                    (route) => false,
              );

              print('✅ Navigated to AppWrapper for location verification');
            }
          });
        }
      } else if (event == AuthChangeEvent.signedOut) {
        if (mounted) {
          setState(() {
            _isGoogleLoggingIn = false;
          });
        }
      }
    });
  }

  Future<bool> _checkImageExists() async {
    try {
      await rootBundle.load('assets/images/google_logo.png');
      return true;
    } catch (e) {
      print('❌ Google logo image not found: $e');
      return false;
    }
  }

  Future<void> _loginWithGoogle() async {
    HapticFeedback.selectionClick();

    setState(() {
      _isGoogleLoggingIn = true;
    });

    try {
      print('🔐 Starting Google OAuth...');

      final authResponse = await supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: 'com.yuknow.ironly://auth-callback',
        authScreenLaunchMode: LaunchMode.externalApplication,
      );

      print('🔐 OAuth initiated: ${authResponse.toString()}');

    } catch (e) {
      setState(() {
        _isGoogleLoggingIn = false;
      });
      _showMessage('Google login failed: ${e.toString()}', isError: true);
      print('❌ Google login error: $e');
    }
  }

  void _navigateToPhoneLogin() {
    HapticFeedback.selectionClick();
    Navigator.push(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => const PhoneLoginScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(1.0, 0.0),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeInOutCubic,
            )),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  void _showMessage(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError ? Icons.error_outline_rounded : Icons.check_circle_outline_rounded,
              color: Colors.white,
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: isError ? Colors.red.shade600 : Colors.green.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        margin: const EdgeInsets.all(20),
        duration: Duration(milliseconds: isError ? 4000 : 3000),
        elevation: 8,
      ),
    );
  }

  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _scaleController.dispose();
    _linkSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              kPrimaryColor.withOpacity(0.1),
              Colors.white,
              Colors.white,
              kPrimaryColor.withOpacity(0.05),
            ],
            stops: const [0.0, 0.3, 0.7, 1.0],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SlideTransition(
                position: _slideAnimation,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 28),
                  child: ScaleTransition(
                    scale: _scaleAnimation,
                    child: Container(
                      constraints: BoxConstraints(
                        maxWidth: 450,
                        minHeight: MediaQuery.of(context).size.height * 0.75,
                      ),
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(32),
                        boxShadow: [
                          BoxShadow(
                            color: kPrimaryColor.withOpacity(0.15),
                            blurRadius: 50,
                            spreadRadius: 5,
                            offset: const Offset(0, 20),
                          ),
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 30,
                            spreadRadius: 0,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Premium Logo & Welcome Section
                          _buildWelcomeSection(),
                          const SizedBox(height: 60),

                          // Google Login Button
                          _buildGoogleLoginButton(),
                          const SizedBox(height: 20),

                          // Phone Login Button
                          _buildPhoneLoginButton(),
                          const SizedBox(height: 50),

                          // Premium Footer
                          _buildPremiumFooter(),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildWelcomeSection() {
    return Column(
      children: [
        // Premium 3D Logo
        Container(
          width: 100,
          height: 100,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                kPrimaryColor,
                kPrimaryColor.withOpacity(0.8),
                kPrimaryColor.withOpacity(0.6),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: kPrimaryColor.withOpacity(0.4),
                blurRadius: 30,
                offset: const Offset(0, 15),
              ),
              BoxShadow(
                color: kPrimaryColor.withOpacity(0.2),
                blurRadius: 60,
                offset: const Offset(0, 30),
              ),
            ],
          ),
          child: const Icon(
            Icons.local_laundry_service_rounded,
            color: Colors.white,
            size: 50,
          ),
        ),
        const SizedBox(height: 32),

        // Welcome Text with Gradient Effect
        ShaderMask(
          shaderCallback: (bounds) => LinearGradient(
            colors: [
              kPrimaryColor,
              kPrimaryColor.withOpacity(0.8),
              kPrimaryColor.withOpacity(0.6),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ).createShader(bounds),
          child: const Text(
            'Welcome to\nironXpress',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 34,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: -0.5,
              height: 1.2,
            ),
          ),
        ),
        const SizedBox(height: 16),

        Text(
          'Your premium laundry service awaits.\nSign in to continue your journey.',
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 16,
            fontWeight: FontWeight.w500,
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildGoogleLoginButton() {
    return Container(
      width: double.infinity,
      height: 64,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            Colors.red.shade50,
            Colors.red.shade400,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: Colors.red.withOpacity(0.2),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.red.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: Colors.red.withOpacity(0.1),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _isGoogleLoggingIn ? null : _loginWithGoogle,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: _isGoogleLoggingIn
                ? Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    color: Colors.red.shade600,
                    strokeWidth: 2.5,
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  'Connecting...',
                  style: TextStyle(
                    color: Colors.red.shade600,
                    fontWeight: FontWeight.w700,
                    fontSize: 17,
                  ),
                ),
              ],
            )
                : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // ✅ PREMIUM GOOGLE G LOGO
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      'G',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                        color: Colors.red.shade600,
                        fontFamily: 'Product Sans', // Google's font
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  'Continue with Google',
                  style: TextStyle(
                    color: Colors.red.shade700,
                    fontWeight: FontWeight.w700,
                    fontSize: 17,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPhoneLoginButton() {
    return Container(
      width: double.infinity,
      height: 64,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: [
            Colors.blue.shade400,
            Colors.blue.shade200,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(
          color: Colors.blue.withOpacity(0.2),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: Colors.blue.withOpacity(0.1),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _navigateToPhoneLogin,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.phone_android_rounded,
                    color: Colors.blue.shade600,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Text(
                  'Continue with Phone',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 17,
                    letterSpacing: 0.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPremiumFooter() {
    return Column(
      children: [
        Container(
          height: 1,
          width: 80,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.transparent,
                Colors.grey.shade300,
                Colors.transparent,
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        Text(
          'Secure • Fast • Reliable',
          style: TextStyle(
            color: Colors.grey.shade500,
            fontSize: 14,
            fontWeight: FontWeight.w600,
            letterSpacing: 2,
          ),
        ),
        const SizedBox(height: 16),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildFeatureIcon(Icons.security_rounded, 'Secure'),
            const SizedBox(width: 32),
            _buildFeatureIcon(Icons.flash_on_rounded, 'Fast'),
            const SizedBox(width: 32),
            _buildFeatureIcon(Icons.verified_rounded, 'Trusted'),
          ],
        ),
      ],
    );
  }

  Widget _buildFeatureIcon(IconData icon, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: kPrimaryColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: kPrimaryColor,
            size: 20,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            color: Colors.grey.shade600,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
