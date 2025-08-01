// ✅ FIXED DeliveryAddressWidget - Complete & Error-Free
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '/widgets/colors.dart';

class DeliveryAddressWidget extends StatefulWidget {
  final VoidCallback? onLocationUpdated;

  const DeliveryAddressWidget({
    super.key,
    this.onLocationUpdated,
  });

  @override
  State<DeliveryAddressWidget> createState() => _DeliveryAddressWidgetState();
}

class _DeliveryAddressWidgetState extends State<DeliveryAddressWidget>
    with TickerProviderStateMixin {
  final supabase = Supabase.instance.client;

  // State management - Auto-loaded from database
  String _userLocation = 'Loading location...';
  bool _isLocationLoading = true;
  bool _isServiceAvailable = true;
  String _eta = '10 to 30 mins';
  bool _isUpdating = false;

  // Location edit functionality
  Position? _currentPosition;
  LatLng? _selectedLocation;
  String _selectedAddress = '';
  GoogleMapController? _mapController;
  Set<Marker> _markers = {};

  // Premium animations
  late AnimationController _shimmerController;
  late AnimationController _pulseController;
  late AnimationController _glowController;
  late AnimationController _iconController;

  late Animation<double> _shimmerAnimation;
  late Animation<double> _pulseAnimation;
  late Animation<double> _glowAnimation;
  late Animation<double> _iconRotation;

  // ✅ Stream subscription for real-time updates
  StreamSubscription<List<Map<String, dynamic>>>? _profileSubscription;

  @override
  void initState() {
    super.initState();
    _initializePremiumAnimations();
    _loadUserLocationFromDatabase();
    _subscribeToLocationUpdates(); // ✅ Real-time updates
  }

  void _initializePremiumAnimations() {
    _shimmerController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );

    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );

    _glowController = AnimationController(
      duration: const Duration(milliseconds: 3000),
      vsync: this,
    );

    _iconController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _shimmerAnimation = Tween<double>(begin: -1.0, end: 2.0).animate(
      CurvedAnimation(parent: _shimmerController, curve: Curves.easeInOut),
    );

    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _glowAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    _iconRotation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _iconController, curve: Curves.elasticOut),
    );

    _shimmerController.repeat();
  }

  // ✅ REAL-TIME SUBSCRIPTION TO LOCATION UPDATES
  void _subscribeToLocationUpdates() {
    final user = supabase.auth.currentUser;
    if (user == null) return;

    print('🔔 DeliveryAddressWidget: Subscribing to location updates...');

    _profileSubscription = supabase
        .from('profiles')
        .stream(primaryKey: ['id'])
        .eq('id', user.id)
        .listen((data) {
      print('🔔 DeliveryAddressWidget: Location update received: $data');
      if (data.isNotEmpty && mounted) {
        _handleLocationUpdate(data.first);
      }
    });
  }

  // ✅ HANDLE REAL-TIME LOCATION UPDATES
  void _handleLocationUpdate(Map<String, dynamic> profileData) async {
    print('🔄 DeliveryAddressWidget: Processing location update...');

    final location = profileData['location'] as String?;
    final lat = profileData['latitude'] as double?;
    final lng = profileData['longitude'] as double?;

    if (location != null && location.isNotEmpty) {
      bool serviceAvailable = true;

      if (lat != null && lng != null) {
        serviceAvailable = await _checkServiceAvailability(lat, lng);
      }

      if (mounted) {
        setState(() {
          _userLocation = location;
          _isLocationLoading = false;
          _isServiceAvailable = serviceAvailable;
          _eta = serviceAvailable ? 'Quick & Faster' : '0 mins';
        });

        _stopLoadingAnimations();
        print('✅ DeliveryAddressWidget: Location updated to: $location (Service: $serviceAvailable)');
      }
    }
  }

  // ✅ ENHANCED AUTO-LOAD WITH BETTER ERROR HANDLING
  Future<void> _loadUserLocationFromDatabase() async {
    print('🔄 DeliveryAddressWidget: Loading user location from database...');

    if (!mounted) return;

    setState(() {
      _isLocationLoading = true;
      _userLocation = 'Loading your delivery address...';
    });

    final user = supabase.auth.currentUser;
    if (user == null) {
      if (mounted) {
        setState(() {
          _userLocation = 'Please login to set location';
          _isLocationLoading = false;
          _isServiceAvailable = false;
        });
      }
      _stopLoadingAnimations();
      return;
    }

    try {
      // ✅ Add retry logic for database connection
      Map<String, dynamic>? response;
      int retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          response = await supabase
              .from('profiles')
              .select('location, latitude, longitude')
              .eq('id', user.id)
              .maybeSingle()
              .timeout(const Duration(seconds: 10));
          break;
        } catch (e) {
          retryCount++;
          print('⚠️ DeliveryAddressWidget: Retry $retryCount for location load: $e');
          if (retryCount < maxRetries) {
            await Future.delayed(Duration(seconds: retryCount * 2));
          }
        }
      }

      if (response != null && response['location'] != null) {
        final location = response['location'] as String;
        final lat = response['latitude'] as double?;
        final lng = response['longitude'] as double?;

        bool serviceAvailable = true;
        if (lat != null && lng != null) {
          serviceAvailable = await _checkServiceAvailability(lat, lng);
        }

        if (mounted) {
          setState(() {
            _userLocation = location;
            _isLocationLoading = false;
            _isServiceAvailable = serviceAvailable;
            _eta = serviceAvailable ? 'Quick & Faster' : '0 mins';
          });
        }

        print('✅ DeliveryAddressWidget: Location loaded - $location (Service: $serviceAvailable)');
      } else {
        // ✅ Better handling when no location is found
        if (mounted) {
          setState(() {
            _userLocation = 'Tap to set your location';
            _isLocationLoading = false;
            _isServiceAvailable = false;
          });
        }
        print('⚠️ DeliveryAddressWidget: No location found, prompting user to set location');
      }
    } catch (e) {
      print('❌ DeliveryAddressWidget: Error loading location - $e');
      if (mounted) {
        setState(() {
          _userLocation = 'Tap to set location';
          _isLocationLoading = false;
          _isServiceAvailable = false;
        });
      }
    }

    _stopLoadingAnimations();
  }

  void _stopLoadingAnimations() {
    _shimmerController.stop();
    _pulseController.repeat(reverse: true);
    if (_isServiceAvailable) {
      _glowController.repeat(reverse: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Transform.scale(
            scale: _isLocationLoading ? 1.0 : _pulseAnimation.value,
            child: Container(
              // ✅ FIXED HEIGHT - No more RenderFlex overflow
              height: 85,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.white,
                    Colors.white.withOpacity(0.98),
                    Colors.grey.shade50.withOpacity(0.9),
                  ],
                  stops: const [0.0, 0.7, 1.0],
                ),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: _isServiceAvailable
                      ? kPrimaryColor.withOpacity(0.15)
                      : Colors.orange.withOpacity(0.15),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: _isServiceAvailable
                        ? kPrimaryColor.withOpacity(0.08)
                        : Colors.orange.withOpacity(0.08),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                    spreadRadius: 2,
                  ),
                  BoxShadow(
                    color: Colors.white.withOpacity(0.9),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(22),
                child: Stack(
                  children: [
                    // Premium glow effect
                    if (_isServiceAvailable && !_isLocationLoading)
                      AnimatedBuilder(
                        animation: _glowAnimation,
                        builder: (context, child) {
                          return Positioned.fill(
                            child: Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(22),
                                gradient: LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    kPrimaryColor.withOpacity(0.03 * _glowAnimation.value),
                                    Colors.transparent,
                                    kPrimaryColor.withOpacity(0.02 * _glowAnimation.value),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),

                    // ✅ FIXED MAIN CONTENT - Better space management
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        children: [
                          // Premium location icon container
                          _buildPremiumLocationIcon(),
                          const SizedBox(width: 14),

                          // ✅ FLEXIBLE ADDRESS CONTENT - Prevents overflow
                          Expanded(
                            child: _buildAddressContent(),
                          ),

                          const SizedBox(width: 10),

                          // Premium edit button
                          _buildPremiumEditButton(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPremiumLocationIcon() {
    return AnimatedBuilder(
      animation: _glowAnimation,
      builder: (context, child) {
        return Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: _isServiceAvailable
                  ? [
                kPrimaryColor.withOpacity(0.15 + 0.05 * _glowAnimation.value),
                kPrimaryColor.withOpacity(0.08 + 0.03 * _glowAnimation.value),
                kPrimaryColor.withOpacity(0.03 + 0.01 * _glowAnimation.value),
              ]
                  : [
                Colors.orange.withOpacity(0.15),
                Colors.orange.withOpacity(0.08),
                Colors.orange.withOpacity(0.03),
              ],
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _isServiceAvailable
                  ? kPrimaryColor.withOpacity(0.2 + 0.1 * _glowAnimation.value)
                  : Colors.orange.withOpacity(0.2),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: _isServiceAvailable
                    ? kPrimaryColor.withOpacity(0.15 + 0.1 * _glowAnimation.value)
                    : Colors.orange.withOpacity(0.15),
                blurRadius: 12 + 3 * _glowAnimation.value,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              if (_isServiceAvailable)
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(
                    gradient: RadialGradient(
                      colors: [
                        kPrimaryColor.withOpacity(0.1 * _glowAnimation.value),
                        Colors.transparent,
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),

              Icon(
                _isLocationLoading
                    ? Icons.location_searching_rounded
                    : _isServiceAvailable
                    ? Icons.location_on_rounded
                    : Icons.location_off_rounded,
                color: _isServiceAvailable ? kPrimaryColor : Colors.orange,
                size: 24,
              ),
            ],
          ),
        );
      },
    );
  }

  // ✅ FIXED ADDRESS CONTENT - Better text handling
  Widget _buildAddressContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      mainAxisSize: MainAxisSize.min, // ✅ Prevents overflow
      children: [
        // Address text
        _isLocationLoading
            ? _buildPremiumShimmerText(width: 180, height: 16)
            : Flexible( // ✅ Flexible wrapper prevents overflow
          child: Text(
            _userLocation,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 15.5,
              fontWeight: FontWeight.w700,
              color: Colors.black87,
              letterSpacing: -0.2,
              height: 1.2,
            ),
          ),
        ),

        const SizedBox(height: 4),

        // ETA text with premium styling
        _isLocationLoading
            ? _buildPremiumShimmerText(width: 140, height: 12)
            : Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: _isServiceAvailable
                  ? [
                kPrimaryColor.withOpacity(0.08),
                kPrimaryColor.withOpacity(0.03),
              ]
                  : [
                Colors.orange.withOpacity(0.08),
                Colors.orange.withOpacity(0.03),
              ],
            ),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _isServiceAvailable
                  ? kPrimaryColor.withOpacity(0.15)
                  : Colors.orange.withOpacity(0.15),
              width: 0.8,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                _isServiceAvailable
                    ? Icons.electric_bolt_rounded
                    : Icons.warning_rounded,
                size: 12,
                color: _isServiceAvailable ? kPrimaryColor : Colors.orange,
              ),
              const SizedBox(width: 3),
              // ✅ FLEXIBLE TEXT - Prevents overflow
              Flexible(
                child: Text(
                  _isServiceAvailable
                      ? 'Choose our Express delivery  $_eta'
                      : 'Service not available',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11.5,
                    color: _isServiceAvailable
                        ? kPrimaryColor.withOpacity(0.85)
                        : Colors.orange.shade700,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.1,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildPremiumEditButton() {
    if (_isLocationLoading) return const SizedBox.shrink();

    return AnimatedBuilder(
      animation: _iconRotation,
      builder: (context, child) {
        return Transform.rotate(
          angle: _isUpdating ? _iconRotation.value * 6.28 : 0,
          child: GestureDetector(
            onTap: _isUpdating ? null : _handleEditLocation,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Colors.grey.shade50,
                    Colors.grey.shade100.withOpacity(0.8),
                    Colors.grey.shade200.withOpacity(0.6),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.grey.shade300.withOpacity(0.8),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.shade300.withOpacity(0.4),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                  BoxShadow(
                    color: Colors.white.withOpacity(0.9),
                    blurRadius: 3,
                    offset: const Offset(0, -1),
                  ),
                ],
              ),
              child: _isUpdating
                  ? Container(
                padding: const EdgeInsets.all(10),
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: kPrimaryColor,
                  backgroundColor: kPrimaryColor.withOpacity(0.2),
                ),
              )
                  : Icon(
                Icons.edit_location_alt_rounded,
                size: 18,
                color: Colors.grey.shade600,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPremiumShimmerText({required double width, required double height}) {
    return AnimatedBuilder(
      animation: _shimmerAnimation,
      builder: (context, child) {
        return Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(6),
            gradient: LinearGradient(
              begin: Alignment(-1.0 + _shimmerAnimation.value, 0.0),
              end: Alignment(1.0 + _shimmerAnimation.value, 0.0),
              colors: [
                Colors.grey.shade300.withOpacity(0.3),
                Colors.grey.shade200.withOpacity(0.8),
                Colors.grey.shade300.withOpacity(0.3),
              ],
              stops: const [0.0, 0.5, 1.0],
            ),
          ),
        );
      },
    );
  }

  // Enhanced edit location functionality
  Future<void> _handleEditLocation() async {
    _iconController.forward().then((_) => _iconController.reverse());

    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        _showPremiumLocationEditDialog();
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          _showPremiumLocationEditDialog();
          return;
        }
      }

      setState(() {
        _isUpdating = true;
      });

      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      List<Placemark> placemarks = await placemarkFromCoordinates(
        _currentPosition!.latitude,
        _currentPosition!.longitude,
      );

      if (placemarks.isNotEmpty) {
        final place = placemarks[0];
        final address = '${place.name ?? place.subLocality ?? ''}, ${place.locality ?? ''}, ${place.postalCode ?? ''}';

        setState(() {
          _selectedLocation = LatLng(_currentPosition!.latitude, _currentPosition!.longitude);
          _selectedAddress = address;
          _markers = {
            Marker(
              markerId: const MarkerId('selected_location'),
              position: _selectedLocation!,
              infoWindow: InfoWindow(title: 'Your Location', snippet: address),
            ),
          };
          _isUpdating = false;
        });

        _showPremiumLocationEditDialog();
      } else {
        setState(() {
          _isUpdating = false;
        });
      }
    } catch (e) {
      print('Error getting location: $e');
      setState(() {
        _isUpdating = false;
      });
      _showPremiumLocationEditDialog();
    }
  }

  void _showPremiumLocationEditDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(0),
        child: _PremiumLocationEditScreen(
          currentPosition: _currentPosition,
          selectedLocation: _selectedLocation,
          selectedAddress: _selectedAddress,
          markers: _markers,
          onLocationSelected: (location, address, markers) {
            setState(() {
              _selectedLocation = location;
              _selectedAddress = address;
              _markers = markers;
            });
          },
          onLocationConfirmed: _confirmLocationUpdate,
          onMapTap: _onMapTap,
        ),
      ),
    );
  }

  Future<void> _onMapTap(LatLng location) async {
    setState(() {
      _selectedLocation = location;
      _markers = {
        Marker(
          markerId: const MarkerId('selected_location'),
          position: location,
          infoWindow: const InfoWindow(title: 'Selected Location'),
        ),
      };
    });

    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        location.latitude,
        location.longitude,
      );

      if (placemarks.isNotEmpty) {
        final place = placemarks[0];
        final address = '${place.name ?? place.subLocality ?? ''}, ${place.locality ?? ''}, ${place.postalCode ?? ''}';
        setState(() {
          _selectedAddress = address;
          _markers = {
            Marker(
              markerId: const MarkerId('selected_location'),
              position: location,
              infoWindow: InfoWindow(title: 'Selected Location', snippet: address),
            ),
          };
        });
      }
    } catch (e) {
      setState(() {
        _selectedAddress = 'Selected location';
      });
    }
  }

  Future<bool> _checkServiceAvailability(double latitude, double longitude) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(
        latitude,
        longitude,
      );

      if (placemarks.isEmpty) return false;

      final place = placemarks[0];
      final pincode = place.postalCode;

      if (pincode == null || pincode.isEmpty) {
        return false;
      }

      final cleanPincode = pincode.replaceAll(RegExp(r'[^0-9]'), '');

      final response = await supabase
          .from('service_areas')
          .select()
          .or('pincode.eq.$pincode,pincode.eq.$cleanPincode')
          .eq('is_active', true)
          .maybeSingle();

      return response != null;
    } catch (e) {
      print('Error checking service availability: $e');
      return false;
    }
  }

  // ✅ ENHANCED LOCATION UPDATE WITH REAL-TIME SYNC
  Future<void> _confirmLocationUpdate() async {
    if (_selectedLocation == null) return;

    setState(() {
      _isUpdating = true;
    });

    try {
      bool serviceAvailable = await _checkServiceAvailability(
        _selectedLocation!.latitude,
        _selectedLocation!.longitude,
      );

      final user = supabase.auth.currentUser;
      if (user != null) {
        List<Placemark> placemarks = await placemarkFromCoordinates(
          _selectedLocation!.latitude,
          _selectedLocation!.longitude,
        );

        String? pincode;
        if (placemarks.isNotEmpty) {
          pincode = placemarks[0].postalCode?.replaceAll(RegExp(r'[^0-9]'), '');
        }

        // ✅ Update database - this will trigger the stream subscription
        await supabase.from('profiles').upsert({
          'id': user.id,
          'location': _selectedAddress,
          'latitude': _selectedLocation!.latitude,
          'longitude': _selectedLocation!.longitude,
          'pincode': pincode,
          'updated_at': DateTime.now().toIso8601String(),
        });

        Navigator.pop(context);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  Icon(
                    serviceAvailable ? Icons.check_circle_rounded : Icons.warning_rounded,
                    color: Colors.white,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      serviceAvailable
                          ? 'Location updated successfully!'
                          : 'Location updated, but service not available in this area',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
              backgroundColor: serviceAvailable ? Colors.green : Colors.orange,
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              margin: const EdgeInsets.all(16),
            ),
          );
        }

        // ✅ Notify parent widget
        if (widget.onLocationUpdated != null) {
          widget.onLocationUpdated!();
        }
      }
    } catch (e) {
      print('Error updating location: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.error_rounded, color: Colors.white, size: 20),
                SizedBox(width: 8),
                Text('Failed to update location', style: TextStyle(fontWeight: FontWeight.w600)),
              ],
            ),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } finally {
      setState(() {
        _isUpdating = false;
      });
    }
  }

  @override
  void dispose() {
    _profileSubscription?.cancel(); // ✅ Cancel subscription
    _shimmerController.dispose();
    _pulseController.dispose();
    _glowController.dispose();
    _iconController.dispose();
    super.dispose();
  }
}

// ✅ COMPLETE Premium Location Edit Screen
class _PremiumLocationEditScreen extends StatefulWidget {
  final Position? currentPosition;
  final LatLng? selectedLocation;
  final String selectedAddress;
  final Set<Marker> markers;
  final Function(LatLng, String, Set<Marker>) onLocationSelected;
  final VoidCallback onLocationConfirmed;
  final Function(LatLng) onMapTap;

  const _PremiumLocationEditScreen({
    required this.currentPosition,
    required this.selectedLocation,
    required this.selectedAddress,
    required this.markers,
    required this.onLocationSelected,
    required this.onLocationConfirmed,
    required this.onMapTap,
  });

  @override
  State<_PremiumLocationEditScreen> createState() => _PremiumLocationEditScreenState();
}

class _PremiumLocationEditScreenState extends State<_PremiumLocationEditScreen>
    with TickerProviderStateMixin {
  GoogleMapController? _mapController;
  bool _isUpdating = false;

  late AnimationController _slideController;
  late AnimationController _fadeController;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
  }

  void _initializeAnimations() {
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));

    _slideController.forward();
    _fadeController.forward();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: Stack(
        children: [
          // Google Map
          FadeTransition(
            opacity: _fadeAnimation,
            child: GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _mapController = controller;
              },
              initialCameraPosition: CameraPosition(
                target: widget.selectedLocation ?? const LatLng(20.2961, 85.8245),
                zoom: 15.0,
              ),
              markers: widget.markers,
              onTap: widget.onMapTap,
              myLocationEnabled: true,
              myLocationButtonEnabled: false,
              zoomControlsEnabled: false,
              mapToolbarEnabled: false,
            ),
          ),

          // Premium top instruction card
          Positioned(
            top: 60,
            left: 16,
            right: 16,
            child: SlideTransition(
              position: _slideAnimation,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.white, Colors.white.withOpacity(0.95)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [kPrimaryColor, kPrimaryColor.withOpacity(0.8)],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.location_on,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Edit Delivery Location',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Tap anywhere on the map',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.black54,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                      color: Colors.black54,
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Current location button
          Positioned(
            bottom: 220,
            right: 16,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [kPrimaryColor, kPrimaryColor.withOpacity(0.8)],
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: kPrimaryColor.withOpacity(0.3),
                    blurRadius: 15,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: IconButton(
                onPressed: () async {
                  if (widget.currentPosition != null) {
                    final currentLatLng = LatLng(
                      widget.currentPosition!.latitude,
                      widget.currentPosition!.longitude,
                    );

                    _mapController?.animateCamera(
                      CameraUpdate.newCameraPosition(
                        CameraPosition(
                          target: currentLatLng,
                          zoom: 15.0,
                        ),
                      ),
                    );

                    widget.onMapTap(currentLatLng);
                  }
                },
                icon: const Icon(
                  Icons.my_location,
                  color: Colors.white,
                  size: 28,
                ),
                padding: const EdgeInsets.all(16),
              ),
            ),
          ),

          // Bottom confirmation section
          Positioned(
            bottom: 20,
            left: 16,
            right: 16,
            child: SlideTransition(
              position: _slideAnimation,
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.white, Colors.white.withOpacity(0.95)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 25,
                      offset: const Offset(0, -10),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [kPrimaryColor.withOpacity(0.2), kPrimaryColor.withOpacity(0.1)],
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            Icons.place,
                            color: kPrimaryColor,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Text(
                          'Selected Location',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      widget.selectedAddress.isNotEmpty ? widget.selectedAddress : 'Tap on map to select location',
                      style: const TextStyle(
                        fontSize: 15,
                        color: Colors.black54,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: widget.selectedLocation != null && !_isUpdating
                            ? () {
                          setState(() {
                            _isUpdating = true;
                          });
                          widget.onLocationConfirmed();
                        }
                            : null,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kPrimaryColor,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: _isUpdating
                            ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                            : const Text(
                          'Update Location',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _slideController.dispose();
    _fadeController.dispose();
    _mapController?.dispose();
    super.dispose();
  }
}
