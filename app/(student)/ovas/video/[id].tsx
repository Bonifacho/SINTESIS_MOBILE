// app/(student)/ovas/video/[id].tsx
// Reproductor de video con soporte jerarquizado:
// 1. Videos directos (MP4, etc.) → expo-video nativo + soporte horizontal
// 2. YouTube → react-native-youtube-iframe
// 3. Embebidos (Vimeo, TikTok, Loom, Drive) → WebView con iframe inyectado
// 4. Otras URLs → WebView genérico con fallback a navegador

import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Dimensions, Linking, StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/theme/colors';
import { useThemeStore } from '@/src/store/themeStore';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = (SCREEN_WIDTH * 9) / 16;

// ── Helpers de extracción de URLs ───────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  return match ? match[1] : null;
}

function getTikTokId(url: string): string | null {
  const match = url.match(/tiktok\.com\/@[^\/]+\/video\/([0-9]+)/);
  return match ? match[1] : null;
}

function getLoomId(url: string): string | null {
  const match = url.match(/loom\.com\/share\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function getDriveId(url: string): string | null {
  const match = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function isDirectVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m3u8'];
  const lowerUrl = url.toLowerCase().split('?')[0];
  return videoExtensions.some((ext) => lowerUrl.endsWith(ext));
}

interface EmbedInfo {
  type: 'direct' | 'youtube' | 'embed' | 'webview' | 'pdf';
  embedUrl?: string;
  youtubeId?: string;
}

function getEmbedUrl(url: string): EmbedInfo {
  if (isDirectVideoUrl(url)) return { type: 'direct' };

  const ytId = getYouTubeId(url);
  if (ytId) return { type: 'youtube', youtubeId: ytId };

  const vimeoId = getVimeoId(url);
  if (vimeoId) return { type: 'embed', embedUrl: `https://player.vimeo.com/video/${vimeoId}?autoplay=1` };

  const tiktokId = getTikTokId(url);
  if (tiktokId) return { type: 'embed', embedUrl: `https://www.tiktok.com/embed/${tiktokId}` };

  const loomId = getLoomId(url);
  if (loomId) return { type: 'embed', embedUrl: `https://www.loom.com/embed/${loomId}` };

  const driveId = getDriveId(url);
  if (driveId) return { type: 'embed', embedUrl: `https://drive.google.com/file/d/${driveId}/preview` };

  const isPdfUrl = url.toLowerCase().split('?')[0].endsWith('.pdf');
  if (isPdfUrl) return { type: 'pdf', embedUrl: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}` };

  return { type: 'webview', embedUrl: url };
}

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();

  const isDark = useThemeStore((s) => s.isDark);
  const styles = makeStyles(isDark);

  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  const embedInfo = getEmbedUrl(url || '');

  // Reproductor nativo (solo para videos directos)
  const player = useVideoPlayer(embedInfo.type === 'direct' ? url : null, (p) => {
    p.loop = false;
    p.play();
    setIsLoading(false);
  });

  // Permitir rotación mientras esta pantalla esté montada
  useEffect(() => {
    ScreenOrientation.unlockAsync();
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });
    return () => {
      // Al salir, volver a portrait
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      sub?.remove();
    };
  }, []);

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

  // Dimensiones dinámicas para landscape
  const currentHeight = isLandscape ? Dimensions.get('window').height : VIDEO_HEIGHT;
  const currentWidth = isLandscape ? Dimensions.get('window').width : SCREEN_WIDTH;

  // ── CASO 1: VIDEO DIRECTO (MP4/M3U8): expo-video nativo ────────────────────────
  if (embedInfo.type === 'direct') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#121212' : '#FFFFFF'} hidden={isLandscape} />

        {!isLandscape && (
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.push('/(student)/subjects'); } }} style={styles.headerBack}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : Colors.dark} />
              <Text style={styles.headerBackText}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => ScreenOrientation.lockAsync(
                isLandscape
                  ? ScreenOrientation.OrientationLock.PORTRAIT_UP
                  : ScreenOrientation.OrientationLock.LANDSCAPE
              )}
              style={{ marginLeft: 'auto', padding: 8 }}
            >
              <Ionicons name="phone-landscape-outline" size={22} color={isDark ? '#FFFFFF' : Colors.dark} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ width: currentWidth, height: isLandscape ? '100%' : currentHeight, backgroundColor: '#000' }}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Cargando video...</Text>
            </View>
          )}
          <VideoView
            ref={videoRef}
            style={{ width: '100%', height: '100%' }}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
        </View>

        {!isLandscape && (
          <View style={styles.infoCard}>
            <Ionicons name="play-circle" size={28} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.videoTitle}>{title || 'Recurso de Video'}</Text>
              <Text style={styles.videoSub}>Reproducción directa · Toca el ícono para pantalla completa</Text>
            </View>
          </View>
        )}

        {isLandscape && (
          <TouchableOpacity
            style={styles.landscapeBackBtn}
            onPress={() => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)}
          >
            <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── CASO 2a: YOUTUBE (react-native-youtube-iframe) ────────────────────────
  if (embedInfo.type === 'youtube') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#121212' : '#FFFFFF'} hidden={isLandscape} />
        {!isLandscape && (
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.push('/(student)/subjects'); } }} style={styles.headerBack}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : Colors.dark} />
              <Text style={styles.headerBackText}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => ScreenOrientation.lockAsync(
                isLandscape ? ScreenOrientation.OrientationLock.PORTRAIT_UP : ScreenOrientation.OrientationLock.LANDSCAPE
              )}
              style={{ marginLeft: 'auto', padding: 8 }}
            >
              <Ionicons name="phone-landscape-outline" size={22} color={isDark ? '#FFFFFF' : Colors.dark} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ width: currentWidth, height: isLandscape ? '100%' : currentHeight, backgroundColor: '#000', justifyContent: 'center' }}>
          {hasError ? (
            <View style={styles.errorOverlay}>
              <Ionicons name="warning-outline" size={48} color={Colors.warning} />
              <Text style={styles.errorOverlayText}>El video no se puede reproducir o está bloqueado.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => Linking.openURL(url!)}>
                <Text style={styles.retryBtnText}>Abrir en YouTube</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.retryBtn, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' }]} onPress={() => { setHasError(false); setIsLoading(true); }}>
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <YoutubePlayer
              height={isLandscape ? currentHeight : VIDEO_HEIGHT}
              width={currentWidth}
              play={true}
              videoId={embedInfo.youtubeId}
              onReady={() => setIsLoading(false)}
              onError={(e: any) => { console.error('YouTube Player Error:', e); setHasError(true); }}
              initialPlayerParams={{ preventFullScreen: false }}
            />
          )}
        </View>

        {!isLandscape && (
          <View style={styles.infoCard}>
            <Ionicons name="logo-youtube" size={28} color="#FF0000" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.videoTitle}>{title || 'Recurso de Video'}</Text>
              <Text style={styles.videoSub}>YouTube Player</Text>
            </View>
          </View>
        )}

        {isLandscape && (
          <TouchableOpacity
            style={styles.landscapeBackBtn}
            onPress={() => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)}
          >
            <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── CASO 2b: EMBED genérico con iframe inyectado ────────────────────────
  if (embedInfo.type === 'embed') {
    const iframeHtml = `<html><body style="margin:0;background:#000;display:flex;justify-content:center;align-items:center;height:100vh;">
      <iframe src="${embedInfo.embedUrl}" width="100%" height="100%"
      frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe>
      </body></html>`;

    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#121212' : '#FFFFFF'} hidden={isLandscape} />
        {!isLandscape && (
          <View style={styles.header}>
            <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.push('/(student)/subjects'); } }} style={styles.headerBack}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : Colors.dark} />
              <Text style={styles.headerBackText}>Volver</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => ScreenOrientation.lockAsync(
                isLandscape ? ScreenOrientation.OrientationLock.PORTRAIT_UP : ScreenOrientation.OrientationLock.LANDSCAPE
              )}
              style={{ marginLeft: 'auto', padding: 8 }}
            >
              <Ionicons name="phone-landscape-outline" size={22} color={isDark ? '#FFFFFF' : Colors.dark} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ width: currentWidth, height: isLandscape ? '100%' : currentHeight, backgroundColor: '#000' }}>
          {isLoading && !hasError && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Cargando reproductor...</Text>
            </View>
          )}
          {hasError ? (
            <View style={styles.errorOverlay}>
              <Ionicons name="videocam-off-outline" size={48} color={Colors.error} />
              <Text style={styles.errorOverlayText}>No se pudo cargar el recurso.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => { setHasError(false); setIsLoading(true); }}>
                <Text style={styles.retryBtnText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              source={{ html: iframeHtml }}
              style={{ flex: 1, backgroundColor: '#000' }}
              allowsFullscreenVideo={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mixedContentMode="always"
              onLoadEnd={() => setIsLoading(false)}
              onError={() => { setIsLoading(false); setHasError(true); }}
            />
          )}
        </View>

        {!isLandscape && (
          <View style={styles.infoCard}>
            <Ionicons name="play-circle" size={28} color={Colors.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.videoTitle}>{title || 'Recurso de Video'}</Text>
              <Text style={styles.videoSub}>Reproductor Integrado</Text>
            </View>
          </View>
        )}

        {isLandscape && (
          <TouchableOpacity
            style={styles.landscapeBackBtn}
            onPress={() => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)}
          >
            <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // ── CASO 3: WebView Genérico para otras URLs ──────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#121212' : '#FFFFFF'} hidden={isLandscape} />
      
      {!isLandscape && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.push('/(student)/subjects'); } }} style={styles.headerBack}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : Colors.dark} />
            <Text style={styles.headerBackText}>Volver</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => ScreenOrientation.lockAsync(
              isLandscape ? ScreenOrientation.OrientationLock.PORTRAIT_UP : ScreenOrientation.OrientationLock.LANDSCAPE
            )}
            style={{ marginLeft: 'auto', padding: 8 }}
          >
            <Ionicons name="phone-landscape-outline" size={22} color={isDark ? '#FFFFFF' : Colors.dark} />
          </TouchableOpacity>
        </View>
      )}

      <View style={{ width: currentWidth, height: isLandscape ? '100%' : currentHeight, backgroundColor: '#000' }}>
        {isLoading && !hasError && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando página...</Text>
          </View>
        )}
        {hasError ? (
          <View style={styles.errorOverlay}>
            <Ionicons name="warning-outline" size={48} color={Colors.warning} />
            <Text style={styles.errorOverlayText}>La página web no permite ser mostrada aquí.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => Linking.openURL(url!)}>
              <Text style={styles.retryBtnText}>Abrir en navegador</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.retryBtn, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fff' }]} onPress={() => { setHasError(false); setIsLoading(true); }}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <WebView
            source={{ uri: embedInfo.embedUrl || url! }}
            style={{ flex: 1, backgroundColor: '#000' }}
            allowsFullscreenVideo={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setHasError(true); }}
          />
        )}
      </View>

      {!isLandscape && (
        <View style={styles.infoCard}>
          <Ionicons name="globe-outline" size={28} color={Colors.info} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.videoTitle}>{title || 'Recurso Web'}</Text>
            <Text style={styles.videoSub}>Navegador Externo</Text>
          </View>
        </View>
      )}

      {isLandscape && (
        <TouchableOpacity
          style={styles.landscapeBackBtn}
          onPress={() => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)}
        >
          <Ionicons name="phone-portrait-outline" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const makeStyles = (isDark: boolean) => StyleSheet.create({
  container:              { flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' },
  centered:               { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24, backgroundColor: isDark ? '#121212' : '#FFFFFF' },
  errorText:              { fontSize: 15, color: Colors.error, textAlign: 'center' },
  backBtn:                { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 8 },
  backBtnText:            { color: '#fff', fontWeight: '700' },
  // Header
  header:                 { flexDirection: 'row', alignItems: 'center', paddingTop: 48, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: isDark ? '#121212' : '#FFFFFF' },
  headerBack:             { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBackText:         { color: isDark ? '#FFFFFF' : Colors.dark, fontSize: 16, fontWeight: '600' },
  // Overlays
  loadingOverlay:         { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10 },
  loadingText:            { color: '#aaa', marginTop: 8, fontSize: 14 },
  errorOverlay:           { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10, gap: 12, paddingHorizontal: 30 },
  errorOverlayText:       { color: '#aaa', fontSize: 14, textAlign: 'center' },
  retryBtn:               { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryBtnText:           { color: '#fff', fontWeight: '700' },
  // Info card
  infoCard:               { flexDirection: 'row', alignItems: 'center', margin: 16, padding: 20, backgroundColor: isDark ? '#1E1E1E' : Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: isDark ? '#2C2C2C' : '#E5E5EA' },
  videoTitle:             { fontSize: 17, fontWeight: '700', color: isDark ? '#FFFFFF' : Colors.dark },
  videoSub:               { fontSize: 13, color: isDark ? '#AAAAAA' : Colors.gray, marginTop: 4 },
  // Landscape
  landscapeBackBtn:       { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8, zIndex: 100 },
});
