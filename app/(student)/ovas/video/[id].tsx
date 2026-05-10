import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { WebView } from 'react-native-webview';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

/** Extrae el ID de un video de YouTube de múltiples formatos de URL */
function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

/** Determina si una URL apunta a un archivo de video directo (mp4, mov, etc.) */
function isDirectVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m3u8'];
  const lowerUrl = url.toLowerCase().split('?')[0]; // Ignora query params
  return videoExtensions.some(ext => lowerUrl.endsWith(ext));
}

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

  const videoRef = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!url) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={52} color={Colors.warning} />
        <Text style={styles.errorText}>No se proporcionó la URL del video.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const youtubeId = getYouTubeId(url);
  const useNativePlayer = isDirectVideoUrl(url);

  // HTML embebido para YouTube — más confiable que cargar la URL embed directamente en WebView
  const youtubeHtml = youtubeId ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; }
        body { background: #000; }
        iframe { width: 100%; height: 100vh; border: none; }
      </style>
    </head>
    <body>
      <iframe 
        src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1&origin=https://www.youtube.com"
        allow="autoplay; encrypted-media; fullscreen"
        allowfullscreen>
      </iframe>
    </body>
    </html>
  ` : null;

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
          <Text style={styles.headerBackText}>Volver</Text>
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <View style={styles.playerContainer}>
        {isLoading && !hasError && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando video...</Text>
          </View>
        )}

        {hasError && (
          <View style={styles.errorOverlay}>
            <Ionicons name="videocam-off-outline" size={48} color={Colors.error} />
            <Text style={styles.errorOverlayText}>No se pudo reproducir el video.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => { setHasError(false); setIsLoading(true); }}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!hasError && useNativePlayer && (
          <Video
            ref={videoRef}
            source={{ uri: url }}
            style={styles.videoPlayer}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onError={(err) => {
              console.error('[VideoPlayer] Error expo-av:', err);
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {!hasError && !useNativePlayer && youtubeHtml && (
          <WebView
            originWhitelist={['*']}
            source={{ html: youtubeHtml, baseUrl: 'https://www.youtube.com' }}
            style={styles.videoPlayer}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}

        {/* Fallback: URL no es ni MP4 ni YouTube — intenta con WebView directo */}
        {!hasError && !useNativePlayer && !youtubeHtml && (
          <WebView
            source={{ uri: url }}
            style={styles.videoPlayer}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        )}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="play-circle" size={28} color={Colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.videoTitle}>{title || 'Recurso de Video'}</Text>
          <Text style={styles.videoSub}>
            {useNativePlayer ? 'Reproducción directa' : youtubeId ? 'YouTube' : 'Streaming'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.dark },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24, backgroundColor: Colors.background },
  errorText:      { fontSize: 15, color: Colors.error, textAlign: 'center' },
  backBtn:        { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  backBtnText:    { color: '#fff', fontWeight: '700' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: Colors.dark,
  },
  headerBack:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBackText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  playerContainer: {
    width: SCREEN_WIDTH,
    height: VIDEO_HEIGHT,
    backgroundColor: '#000',
  },
  videoPlayer:    { width: '100%', height: '100%' },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10,
  },
  loadingText:    { color: '#aaa', marginTop: 8, fontSize: 14 },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10, gap: 12,
  },
  errorOverlayText: { color: '#aaa', fontSize: 14 },
  retryBtn:       { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText:   { color: '#fff', fontWeight: '700' },
  infoCard: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, padding: 20,
    backgroundColor: Colors.surface, borderRadius: 16,
  },
  videoTitle:     { fontSize: 17, fontWeight: '700', color: Colors.dark },
  videoSub:       { fontSize: 13, color: Colors.gray, marginTop: 4 },
});
