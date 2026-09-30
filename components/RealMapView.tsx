import React, { useRef, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Colors from '../constants/Colors';

export interface MapCoordinates {
  latitude: number;
  longitude: number;
}

export interface RealMapViewProps {
  classroomCoords: MapCoordinates;
  classroomName?: string;
  allowedRadius: number;
  userCoords?: MapCoordinates | null;
  userAccuracy?: number | null;
  distance?: number | null;
  isWithinRadius?: boolean | null;
  height?: number;
  showControls?: boolean;
}

export const RealMapView: React.FC<RealMapViewProps> = ({
  classroomCoords,
  classroomName = 'ห้องเรียน',
  allowedRadius = 50,
  userCoords = null,
  userAccuracy = null,
  distance = null,
  isWithinRadius = null,
  height = 240,
  showControls = true,
}) => {
  const webViewRef = useRef<WebView>(null);
  const fullScreenWebViewRef = useRef<WebView>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Helper to generate Leaflet HTML
  const generateMapHtml = (enableZoomControl: boolean) => {
    const classLat = classroomCoords.latitude;
    const classLng = classroomCoords.longitude;
    const hasUser = !!userCoords;
    const userLat = userCoords?.latitude ?? 0;
    const userLng = userCoords?.longitude ?? 0;
    const roomEscaped = (classroomName || 'ห้องเรียน').replace(/'/g, "\\'");
    const radiusMeters = allowedRadius || 50;
    const accuracyMeters = userAccuracy || 0;
    const distText = distance !== null ? `${distance} ม.` : '';
    const within = isWithinRadius === true;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    * { box-sizing: border-box; }
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #EAE6DF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .classroom-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .classroom-badge {
      background: #1E2022;
      color: #F4F1EA;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 12px;
      border: 1.5px solid #F4F1EA;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      white-space: nowrap;
      margin-bottom: 2px;
    }
    .classroom-icon {
      width: 32px;
      height: 32px;
      background: #962A20;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.35);
    }
    .user-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .user-badge {
      background: #225577;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 10px;
      border: 1px solid #FFFFFF;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      white-space: nowrap;
      margin-bottom: 2px;
    }
    .user-dot {
      width: 18px;
      height: 18px;
      background: #1E633F;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(30, 99, 63, 0.8);
      position: relative;
    }
    .user-dot.outside {
      background: #962A20;
      box-shadow: 0 0 10px rgba(150, 42, 32, 0.8);
    }
    .custom-popup .leaflet-popup-content-wrapper {
      background: #F4F1EA;
      border: 1.5px solid #1E2022;
      border-radius: 6px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.2);
      padding: 2px;
    }
    .custom-popup .leaflet-popup-content {
      margin: 6px 10px;
      font-size: 11px;
      line-height: 1.4;
      color: #1E2022;
    }
    .popup-title {
      font-weight: 800;
      font-size: 12px;
      color: #1E2022;
      margin-bottom: 2px;
    }
    .popup-sub {
      font-size: 10px;
      color: #5A6065;
    }
    .distance-label {
      background: rgba(30, 32, 34, 0.88);
      color: #F4F1EA;
      padding: 3px 7px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      border: 1px solid #DED8CB;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
    }
    .leaflet-control-zoom a {
      background: #F4F1EA !important;
      color: #1E2022 !important;
      border: 1.5px solid #1E2022 !important;
      font-weight: 900 !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var classLat = ${classLat};
    var classLng = ${classLng};
    var hasUser = ${hasUser};
    var userLat = ${userLat};
    var userLng = ${userLng};
    var radius = ${radiusMeters};
    var isWithin = ${within};
    var roomName = '${roomEscaped}';

    // Init Leaflet map
    var map = L.map('map', {
      zoomControl: ${enableZoomControl},
      attributionControl: false
    });

    // OpenStreetMap Tile Layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Classroom Icon
    var classIcon = L.divIcon({
      className: '',
      html: '<div class="classroom-pin">' +
              '<div class="classroom-badge">' + roomName + '</div>' +
              '<div class="classroom-icon">🏫</div>' +
            '</div>',
      iconSize: [90, 56],
      iconAnchor: [45, 54],
      popupAnchor: [0, -50]
    });

    var classMarker = L.marker([classLat, classLng], { icon: classIcon, zIndexOffset: 1000 }).addTo(map);
    classMarker.bindPopup('<div class="popup-title">🏫 ' + roomName + '</div><div class="popup-sub">รัศมีที่อนุญาต: ' + radius + ' เมตร</div>', { className: 'custom-popup' });

    // Classroom Allowed Radius Circle
    var circleColor = isWithin ? '#1E633F' : (hasUser ? '#962A20' : '#225577');
    var circleFill = isWithin ? '#2E8B57' : (hasUser ? '#D9534F' : '#4682B4');

    var radiusCircle = L.circle([classLat, classLng], {
      radius: radius,
      color: circleColor,
      weight: 2.5,
      dashArray: '5, 5',
      fillColor: circleFill,
      fillOpacity: 0.16
    }).addTo(map);

    // If User Coords provided
    var userMarker = null;
    var userAccuracyCircle = null;
    var connectLine = null;
    var distMarker = null;

    if (hasUser) {
      var userDotClass = isWithin ? 'user-dot' : 'user-dot outside';
      var userIcon = L.divIcon({
        className: '',
        html: '<div class="user-pin">' +
                '<div class="user-badge">คุณอยู่ที่นี่</div>' +
                '<div class="' + userDotClass + '"></div>' +
              '</div>',
        iconSize: [80, 42],
        iconAnchor: [40, 38],
        popupAnchor: [0, -36]
      });

      userMarker = L.marker([userLat, userLng], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
      userMarker.bindPopup('<div class="popup-title">👤 ตำแหน่งของคุณ</div><div class="popup-sub">${distText ? 'ห่างจากห้องเรียน ' + distText : ''}</div>', { className: 'custom-popup' });

      ${accuracyMeters > 0 ? `
      userAccuracyCircle = L.circle([userLat, userLng], {
        radius: ${accuracyMeters},
        color: '#225577',
        weight: 1,
        fillColor: '#60A5FA',
        fillOpacity: 0.12
      }).addTo(map);
      ` : ''}

      // Polyline between student and classroom
      connectLine = L.polyline([[userLat, userLng], [classLat, classLng]], {
        color: isWithin ? '#1E633F' : '#962A20',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.85
      }).addTo(map);

      ${distText ? `
      var midLat = (classLat + userLat) / 2;
      var midLng = (classLng + userLng) / 2;
      var distIcon = L.divIcon({
        className: '',
        html: '<div class="distance-label">📍 ${distText}</div>',
        iconSize: [70, 24],
        iconAnchor: [35, 12]
      });
      distMarker = L.marker([midLat, midLng], { icon: distIcon }).addTo(map);
      ` : ''}

      // Fit bounds to show both classroom and student
      var bounds = L.latLngBounds([[classLat, classLng], [userLat, userLng]]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18 });
    } else {
      // Center on classroom
      map.setView([classLat, classLng], 17);
    }

    // Window controls
    window.centerClassroom = function() {
      map.flyTo([classLat, classLng], 17, { duration: 0.8 });
      classMarker.openPopup();
    };

    window.centerUser = function() {
      if (hasUser && userMarker) {
        map.flyTo([userLat, userLng], 17, { duration: 0.8 });
        userMarker.openPopup();
      }
    };

    window.fitAll = function() {
      if (hasUser) {
        var b = L.latLngBounds([[classLat, classLng], [userLat, userLng]]);
        map.fitBounds(b, { padding: [60, 60], maxZoom: 18 });
      } else {
        map.setView([classLat, classLng], 17);
      }
    };
  </script>
</body>
</html>`;
  };

  const mapHtml = useMemo(() => generateMapHtml(false), [
    classroomCoords.latitude,
    classroomCoords.longitude,
    classroomName,
    allowedRadius,
    userCoords?.latitude,
    userCoords?.longitude,
    userAccuracy,
    distance,
    isWithinRadius,
  ]);

  const fullScreenMapHtml = useMemo(() => generateMapHtml(true), [
    classroomCoords.latitude,
    classroomCoords.longitude,
    classroomName,
    allowedRadius,
    userCoords?.latitude,
    userCoords?.longitude,
    userAccuracy,
    distance,
    isWithinRadius,
  ]);

  const handleCenterClassroom = (isFull: boolean = false) => {
    const targetRef = isFull ? fullScreenWebViewRef : webViewRef;
    targetRef.current?.injectJavaScript('window.centerClassroom && window.centerClassroom(); true;');
  };

  const handleCenterUser = (isFull: boolean = false) => {
    const targetRef = isFull ? fullScreenWebViewRef : webViewRef;
    targetRef.current?.injectJavaScript('window.centerUser && window.centerUser(); true;');
  };

  const handleFitAll = (isFull: boolean = false) => {
    const targetRef = isFull ? fullScreenWebViewRef : webViewRef;
    targetRef.current?.injectJavaScript('window.fitAll && window.fitAll(); true;');
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.inkDark} />
            <Text style={styles.loadingText}>กำลังโหลดแผนที่ OpenStreetMap...</Text>
          </View>
        )}
      />

      {/* Top Status Header */}
      <View style={styles.mapTopBanner}>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>
            {userCoords
              ? isWithinRadius
                ? `✓ อยู่ในระยะ (${distance !== null ? distance : 0} ม.)`
                : `✕ อยู่นอกระยะ (${distance !== null ? distance : 0} ม. / ${allowedRadius} ม.)`
              : `📍 รัศมี ${allowedRadius} ม.`}
          </Text>
        </View>

        {/* Fullscreen Expand Button at top right */}
        <TouchableOpacity
          style={styles.expandTopBtn}
          onPress={() => setIsFullScreen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.expandTopBtnText}>⛶ ขยายเต็มจอ</Text>
        </TouchableOpacity>
      </View>

      {/* Controls Overlay */}
      {showControls && (
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.controlBtn}
            onPress={() => handleCenterClassroom(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.controlBtnText}>🏫 ห้องเรียน</Text>
          </TouchableOpacity>

          {userCoords && (
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => handleCenterUser(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.controlBtnText}>👤 ตำแหน่งฉัน</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.controlBtn, styles.controlBtnOutline]}
            onPress={() => handleFitAll(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.controlBtnText}>⛶ จัดมุมมอง</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Fullscreen Map Modal */}
      <Modal
        visible={isFullScreen}
        animationType="slide"
        onRequestClose={() => setIsFullScreen(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor="#1E2022" />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalTitle}>แผนที่พิกัดห้องเรียน</Text>
              <Text style={styles.modalSub} numberOfLines={1}>
                {classroomName} • รัศมี {allowedRadius} เมตร
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsFullScreen(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseBtnText}>✕ ปิดเต็มจอ</Text>
            </TouchableOpacity>
          </View>

          {/* Fullscreen Map View */}
          <View style={styles.modalMapContainer}>
            <WebView
              ref={fullScreenWebViewRef}
              originWhitelist={['*']}
              source={{ html: fullScreenMapHtml }}
              style={styles.map}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.inkDark} />
                  <Text style={styles.loadingText}>กำลังเปิดแผนที่เต็มจอ...</Text>
                </View>
              )}
            />

            {/* Quick Action Floating Controls */}
            <View style={styles.modalFloatingControls}>
              <TouchableOpacity
                style={styles.modalFloatingBtn}
                onPress={() => handleCenterClassroom(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalFloatingBtnText}>🏫 ห้องเรียน</Text>
              </TouchableOpacity>

              {userCoords && (
                <TouchableOpacity
                  style={styles.modalFloatingBtn}
                  onPress={() => handleCenterUser(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalFloatingBtnText}>👤 ตำแหน่งฉัน</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.modalFloatingBtn, { backgroundColor: '#1E2022' }]}
                onPress={() => handleFitAll(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.modalFloatingBtnText, { color: '#F4F1EA' }]}>
                  ⛶ มุมมองรวม
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Info Card */}
            <View style={styles.modalBottomCard}>
              <View style={styles.bottomCardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bottomCardLabel}>สถานะการตรวจสอบพิกัด</Text>
                  <Text style={[
                    styles.bottomCardValue,
                    {
                      color: userCoords
                        ? isWithinRadius
                          ? Colors.stampGreen
                          : Colors.stampRed
                        : Colors.inkDark,
                    }
                  ]}>
                    {userCoords
                      ? isWithinRadius
                        ? '✓ อยู่ในรัศมีห้องเรียน'
                        : '✕ อยู่นอกรัศมีห้องเรียน'
                      : '○ ยังไม่ได้ระบุพิกัดนักศึกษา'}
                  </Text>
                </View>

                {distance !== null && (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.bottomCardLabel}>ระยะห่าง</Text>
                    <Text style={styles.bottomCardValue}>{distance} เมตร</Text>
                  </View>
                )}
              </View>

              {userAccuracy !== null && userAccuracy !== undefined && (
                <Text style={styles.bottomCardAccuracy}>
                  ความแม่นยำของสัญญาณ GPS: ±{userAccuracy} เมตร • รัศมีที่กำหนด: {allowedRadius} เมตร
                </Text>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EAE6DF',
  },
  map: {
    flex: 1,
    backgroundColor: '#EAE6DF',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F4F1EA',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.inkMuted,
  },
  mapTopBanner: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  statusPill: {
    backgroundColor: 'rgba(30, 32, 34, 0.88)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.panelBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  statusPillText: {
    color: '#F4F1EA',
    fontSize: 10,
    fontWeight: '800',
  },
  expandTopBtn: {
    backgroundColor: '#F4F1EA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 3,
  },
  expandTopBtnText: {
    color: Colors.inkDark,
    fontSize: 10,
    fontWeight: '900',
  },
  controlsRow: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
    pointerEvents: 'box-none',
  },
  controlBtn: {
    backgroundColor: '#F4F1EA',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 2,
  },
  controlBtnOutline: {
    backgroundColor: '#DED8CB',
  },
  controlBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#1E2022',
  },
  modalHeader: {
    backgroundColor: '#1E2022',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#3A3D40',
  },
  modalHeaderInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F4F1EA',
    letterSpacing: 0.5,
  },
  modalSub: {
    fontSize: 11,
    color: '#A8A49C',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: Colors.stampRed,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalMapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#EAE6DF',
  },
  modalFloatingControls: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'column',
    gap: 8,
    zIndex: 10,
  },
  modalFloatingBtn: {
    backgroundColor: '#F4F1EA',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.inkDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    alignItems: 'center',
  },
  modalFloatingBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkDark,
  },
  modalBottomCard: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(244, 241, 234, 0.96)',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.inkDark,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.inkMuted,
    letterSpacing: 0.5,
  },
  bottomCardValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
  },
  bottomCardAccuracy: {
    fontSize: 10,
    color: Colors.inkMuted,
    marginTop: 6,
    borderTopWidth: 1,
    borderColor: Colors.borderLight,
    paddingTop: 6,
  },
});
