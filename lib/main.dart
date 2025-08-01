// ✅ FIXED ELECTRIC IRON MAIN.DART - PROPER HEADER DISPLAY & RESPONSIVE DESIGN
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

import 'screens/home_screen.dart';
import 'screens/colors.dart';
import 'screens/login_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/app_wrapper.dart';
import 'widgets/notification_service.dart';
// import 'firebase_options.dart'; // ✅ Uncomment if using manual config

// 👇 GLOBAL CART COUNT NOTIFIER
final ValueNotifier<int> cartItemCountNotifier = ValueNotifier<int>(0);

// ✅ BACKGROUND MESSAGE HANDLER (TOP-LEVEL FUNCTION)
@pragma('vm:entry-point')
Future<void> _handleBackgroundMessage(RemoteMessage message) async {
  print('📱 Background message received: ${message.messageId}');

  try {
    // Initialize Firebase if needed
    await Firebase.initializeApp();

    // Initialize Supabase if needed - Check if already initialized
    try {
      // Try to access Supabase to see if it's initialized
      Supabase.instance.client;
    } catch (e) {
      // If not initialized, initialize it
      await Supabase.initialize(
        url: 'https://qehtgclgjhzdlqcjujpp.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlaHRnY2xnamh6ZGxxY2p1anBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDk2NzYsImV4cCI6MjA2NjQyNTY3Nn0.P7buCrNPIBShznBQgkdEHx6BG5Bhv9HOq7pn6e0HfLo',
      );
    }

    // Store notification in background
    await Supabase.instance.client.from('notifications').insert({
      'message_id': message.messageId,
      'title': message.notification?.title ?? 'IronXpress',
      'body': message.notification?.body ?? '',
      'data': message.data,
      'type': message.data['type'] ?? 'general',
      'is_read': false,
      'created_at': DateTime.now().toIso8601String(),
    });
    print('✅ Background notification stored');
  } catch (e) {
    print('❌ Error in background handler: $e');
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // ✅ SET PREFERRED ORIENTATIONS AND SYSTEM UI
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // ✅ CONFIGURE SYSTEM UI OVERLAY STYLE FOR BETTER VISIBILITY
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      statusBarBrightness: Brightness.dark, // For iOS
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
      systemNavigationBarDividerColor: Colors.transparent,
    ),
  );

  // ✅ ENABLE EDGE-TO-EDGE DISPLAY WITH PROPER HANDLING
  await SystemChrome.setEnabledSystemUIMode(
    SystemUiMode.edgeToEdge,
  );

  print('🚀 Initializing ironXpress with notifications...');

  try {
    // ✅ Initialize EasyLocalization FIRST
    await EasyLocalization.ensureInitialized();
    print('✅ Localization initialized');

    // ✅ Initialize Firebase with comprehensive error handling
    bool firebaseInitialized = false;
    try {
      // Option 1: Auto-configure (requires google-services.json)
      await Firebase.initializeApp();

      // Option 2: Manual configure (uncomment if google-services.json doesn't work)
      // await Firebase.initializeApp(options: DefaultFirebaseOptions.currentPlatform);

      print('✅ Firebase initialized successfully');
      firebaseInitialized = true;

      // ✅ Set background message handler
      FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);
      print('✅ Background message handler set');
    } catch (firebaseError) {
      print('❌ Firebase initialization failed: $firebaseError');
      print('📱 Please check:');
      print('📱 1. google-services.json is in android/app/');
      print('📱 2. Package name matches: com.yuknow.ironly');
      print('📱 3. Firebase project is properly configured');
      print('📱 Continuing without Firebase notifications...');
    }

    // ✅ Initialize Supabase (independent of Firebase)
    await Supabase.initialize(
      url: 'https://qehtgclgjhzdlqcjujpp.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlaHRnY2xnamh6ZGxxY2p1anBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDk2NzYsImV4cCI6MjA2NjQyNTY3Nn0.P7buCrNPIBShznBQgkdEHx6BG5Bhv9HOq7pn6e0HfLo',
    );
    print('✅ Supabase initialized');

    // ✅ Initialize Notification Service (only if Firebase works)
    if (firebaseInitialized) {
      try {
        await NotificationService().initialize();
        print('✅ Notification service initialized');
      } catch (notificationError) {
        print('⚠️ Notification service failed: $notificationError');
        print('📱 Continuing without notifications...');
      }
    } else {
      print('⚠️ Skipping notification service (Firebase not available)');
    }

    print('🎉 App initialization complete!');
  } catch (e) {
    print('❌ Critical error during initialization: $e');
    print('📱 Starting app with limited functionality...');
  }

  runApp(
    EasyLocalization(
      supportedLocales: const [
        Locale('en'), // English
        Locale('or'), // Odia
        Locale('hi'), // Hindi
      ],
      path: 'assets/lang',
      fallbackLocale: const Locale('en'),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: cartItemCountNotifier,
      builder: (context, count, _) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'ironXpress',
          localizationsDelegates: context.localizationDelegates,
          supportedLocales: context.supportedLocales,
          locale: context.locale,
          theme: ThemeData(
            primarySwatch: Colors.deepPurple,
            elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(backgroundColor: kPrimaryColor),
            ),
            textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(foregroundColor: kPrimaryColor),
            ),
            appBarTheme: const AppBarTheme(
              backgroundColor: kPrimaryColor,
              foregroundColor: Colors.white,
              systemOverlayStyle: SystemUiOverlayStyle(
                statusBarColor: Colors.transparent,
                statusBarIconBrightness: Brightness.light,
                statusBarBrightness: Brightness.dark, // For iOS
              ),
            ),
            inputDecorationTheme: const InputDecorationTheme(
              border: OutlineInputBorder(),
              focusedBorder: OutlineInputBorder(
                borderSide: BorderSide(color: kPrimaryColor, width: 2.0),
              ),
              labelStyle: TextStyle(color: kPrimaryColor),
            ),
            // ✅ ADD BOTTOM NAVIGATION BAR THEME
            bottomNavigationBarTheme: const BottomNavigationBarThemeData(
              backgroundColor: Colors.white,
              selectedItemColor: kPrimaryColor,
              unselectedItemColor: Colors.grey,
              type: BottomNavigationBarType.fixed,
              elevation: 8,
            ),
          ),
          // ✅ Use premium iron-themed entry point with proper SafeArea
          home: const IronXpressPremiumEntry(),
          // ✅ ENHANCED ERROR HANDLING & RESPONSIVE DESIGN WITH PROPER SAFE AREA
          builder: (context, child) {
            // ✅ Get screen dimensions and safe area info
            final mediaQuery = MediaQuery.of(context);
            final screenHeight = mediaQuery.size.height;
            final screenWidth = mediaQuery.size.width;
            final topPadding = mediaQuery.padding.top;
            final bottomPadding = mediaQuery.padding.bottom;
            final leftPadding = mediaQuery.padding.left;
            final rightPadding = mediaQuery.padding.right;

            // ✅ Calculate actual safe area insets
            final viewInsets = mediaQuery.viewInsets;
            final viewPadding = mediaQuery.viewPadding;

            // ✅ Calculate effective bottom padding for navigation
            final effectiveBottomPadding = bottomPadding > 0 ? bottomPadding : viewPadding.bottom;
            final hasBottomInsets = effectiveBottomPadding > 0;

            print('📱 App Builder Debug:');
            print('📱 Screen: ${screenWidth}x${screenHeight}');
            print('📱 Safe Area: top=$topPadding, bottom=$bottomPadding, left=$leftPadding, right=$rightPadding');
            print('📱 View Padding: top=${viewPadding.top}, bottom=${viewPadding.bottom}');
            print('📱 View Insets: top=${viewInsets.top}, bottom=${viewInsets.bottom}');
            print('📱 Effective Bottom: $effectiveBottomPadding, Has Bottom Insets: $hasBottomInsets');

            return MediaQuery(
              data: mediaQuery.copyWith(
                // ✅ PREVENT TEXT SCALING ISSUES
                textScaleFactor: mediaQuery.textScaleFactor.clamp(0.8, 1.3),
                // ✅ ENSURE PROPER PADDING CALCULATIONS - PRESERVE ORIGINAL SAFE AREA
                padding: EdgeInsets.only(
                  top: max(topPadding, viewPadding.top),
                  bottom: max(bottomPadding, viewPadding.bottom),
                  left: max(leftPadding, viewPadding.left),
                  right: max(rightPadding, viewPadding.right),
                ),
                // ✅ PRESERVE VIEW PADDING FOR WIDGETS THAT NEED IT
                viewPadding: EdgeInsets.only(
                  top: max(viewPadding.top, topPadding),
                  bottom: max(viewPadding.bottom, bottomPadding),
                  left: max(viewPadding.left, leftPadding),
                  right: max(viewPadding.right, rightPadding),
                ),
              ),
              child: child!,
            );
          },
        );
      },
    );
  }
}

// ✅ PREMIUM IRON-THEMED ENTRY WITH PROPER SAFE AREA HANDLING
class IronXpressPremiumEntry extends StatefulWidget {
  const IronXpressPremiumEntry({super.key});

  @override
  State<IronXpressPremiumEntry> createState() => _IronXpressPremiumEntryState();
}

class _IronXpressPremiumEntryState extends State<IronXpressPremiumEntry>
    with TickerProviderStateMixin {

  // ELECTRIC IRON 10-second animation controllers
  late AnimationController _ironController;
  late AnimationController _steamController;
  late AnimationController _heatController;
  late AnimationController _textController;
  late AnimationController _sparkController;
  late AnimationController _glowController;

  late Animation<double> _ironScale;
  late Animation<double> _ironOpacity;
  late Animation<double> _steamAnimation;
  late Animation<double> _heatAnimation;
  late Animation<double> _textOpacity;
  late Animation<double> _sparkAnimation;
  late Animation<double> _glowAnimation;

  String _statusMessage = 'Heating up the iron...';

  @override
  void initState() {
    super.initState();
    _initializeElectricIronAnimations();
    _startIronXpressSplash();
  }

  void _initializeElectricIronAnimations() {
    // Iron heating animation
    _ironController = AnimationController(
      duration: const Duration(milliseconds: 2500),
      vsync: this,
    );

    // Steam generation
    _steamController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    // Heat glow effect
    _heatController = AnimationController(
      duration: const Duration(milliseconds: 1800),
      vsync: this,
    );

    // Text animation
    _textController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    // Electric sparks
    _sparkController = AnimationController(
      duration: const Duration(milliseconds: 2200),
      vsync: this,
    );

    // Glow effect
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _ironScale = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _ironController, curve: Curves.elasticOut),
    );

    _ironOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _ironController, curve: Curves.easeInOut),
    );

    _steamAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _steamController, curve: Curves.easeInOut),
    );

    _heatAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _heatController, curve: Curves.easeInOut),
    );

    _textOpacity = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _textController, curve: Curves.easeInOut),
    );

    _sparkAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _sparkController, curve: Curves.easeInOut),
    );

    _glowAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );
  }

  Future<void> _startIronXpressSplash() async {
    print('🔥 Starting ironXpress...');

    // Phase 1: Iron plugging in and heating up (0-2s)
    if (mounted) {
      setState(() {
        _statusMessage = 'Plugging in services...';
      });
    }
    _ironController.forward();
    _glowController.repeat(reverse: true);
    await Future.delayed(const Duration(milliseconds: 2000));

    // Phase 2: Generating steam and heat (2-4s)
    if (mounted) {
      setState(() {
        _statusMessage = 'Generating notifications...';
      });
    }
    _steamController.repeat(reverse: true);
    _heatController.repeat(reverse: true);

    // ✅ Setup notification listeners during splash
    await _setupNotificationSystemAsync();
    await Future.delayed(const Duration(milliseconds: 2000));

    // Phase 3: Electric sparks and power (4-6s)
    if (mounted) {
      setState(() {
        _statusMessage = 'Power optimization...';
      });
    }
    _textController.forward();
    _sparkController.repeat();
    await Future.delayed(const Duration(milliseconds: 2000));

    // Phase 4: Perfect temperature reached (6-8s)
    if (mounted) {
      setState(() {
        _statusMessage = 'Reaching perfect temperature...';
      });
    }
    await Future.delayed(const Duration(milliseconds: 2000));

    // Phase 5: Ready for service (8-10s)
    if (mounted) {
      setState(() {
        _statusMessage = 'Ready at your service...';
      });
    }
    await Future.delayed(const Duration(milliseconds: 2000));

    // Stop animations and navigate to AppWrapper
    _steamController.stop();
    _heatController.stop();
    _sparkController.stop();
    _glowController.stop();

    print('🎉 ironXpress ready with notifications!');
    _navigateToAppWrapper();
  }

  // ✅ Setup notification system during splash screen
  Future<void> _setupNotificationSystemAsync() async {
    try {
      // Setup auth state listener for notifications
      Supabase.instance.client.auth.onAuthStateChange.listen((data) async {
        final user = data.session?.user;
        if (user != null) {
          print('📱 User logged in, setting up notifications for: ${user.id}');

          // Setup user-specific notification listeners
          try {
            if (NotificationService().isInitialized) {
              await NotificationService().subscribeToTopics(user.id);
              print('✅ User notifications setup complete for: ${user.id}');
            } else {
              print('⚠️ Notification service not initialized, skipping topic subscription');
            }
          } catch (e) {
            print('❌ Error setting up user notifications: $e');
          }

          // Send welcome notification for new users (optional)
          try {
            final existing = await Supabase.instance.client
                .from('user_profiles')
                .select('user_id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (existing == null) {
              await Future.delayed(const Duration(seconds: 3));
              // You can implement welcome notification logic here
              print('📱 New user detected, could send welcome notification');
            }
          } catch (e) {
            print('❌ Error checking user profile: $e');
          }
        } else {
          print('📱 User signed out, cleaning up notifications');
          try {
            // Unsubscribe from topics when user logs out
            final currentUser = Supabase.instance.client.auth.currentUser;
            if (currentUser != null && NotificationService().isInitialized) {
              await NotificationService().unsubscribeFromTopics(currentUser.id);
            }
          } catch (e) {
            print('❌ Error cleaning up notifications: $e');
          }
        }
      });

      print('✅ Notification system setup complete');
    } catch (e) {
      print('❌ Error setting up notification system: $e');
    }
  }

  void _navigateToAppWrapper() {
    if (mounted) {  // ✅ Check if widget is still mounted
      // ✅ Add a longer delay to ensure Supabase is fully ready
      Future.delayed(const Duration(milliseconds: 1500), () {
        if (mounted) {
          Navigator.pushReplacement(
            context,
            PageRouteBuilder(
              pageBuilder: (context, animation, secondaryAnimation) => const AppWrapper(),
              transitionDuration: const Duration(milliseconds: 800),
              transitionsBuilder: (context, animation, secondaryAnimation, child) {
                return FadeTransition(
                  opacity: animation,
                  child: SlideTransition(
                    position: Tween<Offset>(
                      begin: const Offset(1.0, 0.0),
                      end: Offset.zero,
                    ).animate(CurvedAnimation(
                      parent: animation,
                      curve: Curves.easeInOut,
                    )),
                    child: child,
                  ),
                );
              },
            ),
          );
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // ✅ GET RESPONSIVE DIMENSIONS WITH PROPER SAFE AREA CALCULATION
    final mediaQuery = MediaQuery.of(context);
    final size = mediaQuery.size;
    final padding = mediaQuery.padding;
    final viewPadding = mediaQuery.viewPadding;
    final viewInsets = mediaQuery.viewInsets;

    // ✅ Calculate effective safe areas
    final effectiveTopPadding = max(padding.top, viewPadding.top);
    final effectiveBottomPadding = max(padding.bottom, viewPadding.bottom);
    final effectiveLeftPadding = max(padding.left, viewPadding.left);
    final effectiveRightPadding = max(padding.right, viewPadding.right);

    // ✅ Calculate available content area
    final availableHeight = size.height - effectiveTopPadding - effectiveBottomPadding - viewInsets.bottom;
    final availableWidth = size.width - effectiveLeftPadding - effectiveRightPadding;

    // ✅ RESPONSIVE SIZING BASED ON AVAILABLE SPACE
    final isSmallScreen = availableHeight < 600;
    final isLargeScreen = availableHeight > 800;
    final isWideScreen = availableWidth > 400;

    // ✅ ADAPTIVE SIZING
    final ironSize = isSmallScreen ? 120.0 : (isLargeScreen ? 180.0 : 150.0);
    final titleFontSize = isSmallScreen ? 36.0 : (isLargeScreen ? 56.0 : 46.0);
    final subtitleFontSize = isSmallScreen ? 12.0 : (isLargeScreen ? 18.0 : 15.0);
    final statusFontSize = isSmallScreen ? 14.0 : (isLargeScreen ? 20.0 : 17.0);

    return Scaffold(
      // ✅ ENSURE BODY EXTENDS BEHIND SYSTEM BARS BUT CONTENT IS SAFE
      extendBodyBehindAppBar: true,
      extendBody: true,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              const Color(0xFF1565C0).withOpacity(0.9), // Electric blue
              const Color(0xFF2196F3).withOpacity(0.8), // Blue
              const Color(0xFF42A5F5).withOpacity(0.7), // Light blue
              const Color(0xFF90CAF9).withOpacity(0.9), // Very light blue
            ],
            stops: const [0.0, 0.3, 0.7, 1.0],
          ),
        ),
        child: SafeArea(
          // ✅ ENSURE PROPER SAFE AREA HANDLING
          top: true,
          bottom: true,
          left: true,
          right: true,
          minimum: EdgeInsets.only(
            top: effectiveTopPadding > 0 ? 8.0 : 24.0,
            bottom: effectiveBottomPadding > 0 ? 8.0 : 24.0,
            left: effectiveLeftPadding > 0 ? 4.0 : 16.0,
            right: effectiveRightPadding > 0 ? 4.0 : 16.0,
          ),
          child: Stack(
            children: [
              // Electric spark particles - positioned relative to safe area
              ...List.generate(20, (index) => _buildElectricSpark(index, availableWidth, availableHeight)),

              // Main content - properly centered within safe area
              Container(
                width: double.infinity,
                height: double.infinity,
                padding: EdgeInsets.symmetric(
                  horizontal: availableWidth * 0.05,
                  vertical: availableHeight * 0.02,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // ✅ Flexible spacing at top
                    const Spacer(flex: 1),

                    // Animated electric iron with heat and steam
                    AnimatedBuilder(
                      animation: _ironController,
                      builder: (context, child) {
                        return Transform.scale(
                          scale: _ironScale.value,
                          child: Opacity(
                            opacity: _ironOpacity.value,
                            child: AnimatedBuilder(
                              animation: _heatController,
                              builder: (context, child) {
                                return AnimatedBuilder(
                                  animation: _glowController,
                                  builder: (context, child) {
                                    return Container(
                                      width: ironSize,
                                      height: ironSize,
                                      decoration: BoxDecoration(
                                        gradient: RadialGradient(
                                          colors: [
                                            Colors.white.withOpacity(0.4),
                                            Colors.orange.withOpacity(0.3 * _heatAnimation.value),
                                            Colors.red.withOpacity(0.2 * _heatAnimation.value),
                                            Colors.blue.withOpacity(0.1),
                                          ],
                                          stops: const [0.0, 0.5, 0.7, 1.0],
                                        ),
                                        shape: BoxShape.circle,
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.orange.withOpacity(0.6 * _glowAnimation.value),
                                            blurRadius: 60,
                                            offset: const Offset(0, 0),
                                          ),
                                          BoxShadow(
                                            color: Colors.blue.withOpacity(0.3 * _glowAnimation.value),
                                            blurRadius: 100,
                                            offset: const Offset(0, 20),
                                          ),
                                        ],
                                      ),
                                      child: Stack(
                                        alignment: Alignment.center,
                                        children: [
                                          // Main iron icon with notification badge
                                          Stack(
                                            children: [
                                              Icon(
                                                Icons.iron,
                                                size: ironSize * 0.5625, // Maintain aspect ratio
                                                color: Colors.white,
                                              ),
                                              // Notification indicator
                                              Positioned(
                                                top: 5,
                                                right: 5,
                                                child: AnimatedBuilder(
                                                  animation: _textController,
                                                  builder: (context, child) {
                                                    return Opacity(
                                                      opacity: _textOpacity.value,
                                                      child: Container(
                                                        width: 12,
                                                        height: 12,
                                                        decoration: BoxDecoration(
                                                          color: Colors.red,
                                                          shape: BoxShape.circle,
                                                          boxShadow: [
                                                            BoxShadow(
                                                              color: Colors.red.withOpacity(0.5),
                                                              blurRadius: 8,
                                                              offset: Offset.zero,
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    );
                                                  },
                                                ),
                                              ),
                                            ],
                                          ),
                                          // Steam effect
                                          AnimatedBuilder(
                                            animation: _steamController,
                                            builder: (context, child) {
                                              return Positioned(
                                                top: 15,
                                                child: Opacity(
                                                  opacity: _steamAnimation.value * 0.8,
                                                  child: Transform.scale(
                                                    scale: 1 + _steamAnimation.value * 0.5,
                                                    child: Icon(
                                                      Icons.cloud,
                                                      size: ironSize * 0.21875,
                                                      color: Colors.white70,
                                                    ),
                                                  ),
                                                ),
                                              );
                                            },
                                          ),
                                          // Heat indicator
                                          AnimatedBuilder(
                                            animation: _heatController,
                                            builder: (context, child) {
                                              return Positioned(
                                                bottom: 15,
                                                child: Opacity(
                                                  opacity: _heatAnimation.value * 0.9,
                                                  child: Container(
                                                    width: 20,
                                                    height: 20,
                                                    decoration: BoxDecoration(
                                                      color: Colors.orange,
                                                      shape: BoxShape.circle,
                                                      boxShadow: [
                                                        BoxShadow(
                                                          color: Colors.orange.withOpacity(0.8),
                                                          blurRadius: 15,
                                                          offset: Offset.zero,
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ),
                                              );
                                            },
                                          ),
                                        ],
                                      ),
                                    );
                                  },
                                );
                              },
                            ),
                          ),
                        );
                      },
                    ),

                    // ✅ Responsive spacing
                    SizedBox(height: availableHeight * 0.06),

                    // Iron service branding
                    AnimatedBuilder(
                      animation: _textController,
                      builder: (context, child) {
                        return Opacity(
                          opacity: _textOpacity.value,
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(
                              'ironXpress',
                              style: TextStyle(
                                fontSize: titleFontSize,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                letterSpacing: isWideScreen ? 4 : 2,
                                shadows: const [
                                  Shadow(
                                    color: Colors.black38,
                                    offset: Offset(0, 3),
                                    blurRadius: 6,
                                  ),
                                  Shadow(
                                    color: Colors.orange,
                                    offset: Offset(0, 0),
                                    blurRadius: 20,
                                  ),
                                ],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        );
                      },
                    ),

                    // ✅ Responsive spacing
                    SizedBox(height: availableHeight * 0.025),

                    // Service types
                    AnimatedBuilder(
                      animation: _textController,
                      builder: (context, child) {
                        return Opacity(
                          opacity: _textOpacity.value * 0.9,
                          child: FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(
                              'Iron Services • Smart Notifications',
                              style: TextStyle(
                                fontSize: subtitleFontSize,
                                color: Colors.white,
                                fontWeight: FontWeight.w400,
                                letterSpacing: isWideScreen ? 1 : 0.5,
                                shadows: const [
                                  Shadow(
                                    color: Colors.black26,
                                    offset: Offset(0, 1),
                                    blurRadius: 3,
                                  ),
                                ],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        );
                      },
                    ),

                    // ✅ Flexible spacing
                    const Spacer(flex: 2),

                    // Loading indicator with notification setup status
                    AnimatedBuilder(
                      animation: _textController,
                      builder: (context, child) {
                        return Opacity(
                          opacity: _textOpacity.value,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: isSmallScreen ? 50 : 60,
                                height: isSmallScreen ? 50 : 60,
                                decoration: BoxDecoration(
                                  gradient: RadialGradient(
                                    colors: [
                                      Colors.white.withOpacity(0.15),
                                      Colors.orange.withOpacity(0.1),
                                    ],
                                  ),
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.orange.withOpacity(0.3),
                                      blurRadius: 25,
                                      offset: const Offset(0, 5),
                                    ),
                                  ],
                                ),
                                child: Center(
                                  child: SizedBox(
                                    width: isSmallScreen ? 30 : 40,
                                    height: isSmallScreen ? 30 : 40,
                                    child: CircularProgressIndicator(
                                      valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.white.withOpacity(0.95),
                                      ),
                                      strokeWidth: 3,
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(height: availableHeight * 0.025),
                              Container(
                                constraints: BoxConstraints(
                                  maxWidth: availableWidth * 0.8,
                                ),
                                child: FittedBox(
                                  fit: BoxFit.scaleDown,
                                  child: Text(
                                    _statusMessage,
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.95),
                                      fontSize: statusFontSize,
                                      fontWeight: FontWeight.w500,
                                      letterSpacing: 1.2,
                                      shadows: const [
                                        Shadow(
                                          color: Colors.black26,
                                          offset: Offset(0, 1),
                                          blurRadius: 3,
                                        ),
                                      ],
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),

                    // ✅ Bottom spacing to ensure content doesn't touch edges
                    SizedBox(height: max(availableHeight * 0.08, 20)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildElectricSpark(int index, double availableWidth, double availableHeight) {
    final random = (index * 67890) % 1000 / 1000.0;
    final sparkSize = 3 + random * 12;

    return Positioned(
      left: random * availableWidth,
      top: (random * 0.9 + 0.05) * availableHeight,
      child: AnimatedBuilder(
        animation: _sparkController,
        builder: (context, child) {
          return AnimatedBuilder(
            animation: _heatController,
            builder: (context, child) {
              return Transform.translate(
                offset: Offset(
                  (random - 0.5) * 100 * (_sparkAnimation.value) +
                      (random - 0.5) * 30 * (_heatAnimation.value),
                  -40 * (_sparkAnimation.value) +
                      (random - 0.5) * 50 * (_heatAnimation.value),
                ),
                child: Opacity(
                  opacity: (0.2 + random * 0.7) * _ironOpacity.value,
                  child: Container(
                    width: sparkSize,
                    height: sparkSize,
                    decoration: BoxDecoration(
                      gradient: RadialGradient(
                        colors: [
                          Colors.yellow.withOpacity(0.9),
                          Colors.orange.withOpacity(0.6),
                          Colors.blue.withOpacity(0.3),
                        ],
                        stops: const [0.0, 0.6, 1.0],
                      ),
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.yellow.withOpacity(0.5),
                          blurRadius: sparkSize * 1.2,
                          offset: Offset.zero,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }

  @override
  void dispose() {
    _ironController.dispose();
    _steamController.dispose();
    _heatController.dispose();
    _textController.dispose();
    _sparkController.dispose();
    _glowController.dispose();
    super.dispose();
  }
}
