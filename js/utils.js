// 유틸리티 함수

// 날짜 포맷 (YYYY-MM-DD → YYYY.MM.DD)
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr.replace(/-/g, '.');
}

// 파일 크기 포맷
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 용량 제한 (bytes)
const PLAN_LIMITS = {
  free: {
    maxPets: 1,
    maxStorage: 1 * 1024 * 1024 * 1024, // 1GB
    label: '별빛 무료'
  },
  plus: {
    maxPets: 10,
    maxStorage: 20 * 1024 * 1024 * 1024, // 20GB
    label: '별빛 플러스'
  }
};

// Storage public URL 생성
function getPublicUrl(path) {
  if (!path) return null;
  try {
    const client = (typeof getSupabase === 'function' ? getSupabase() : null) || supabase;
    if (client && client.storage) {
      const { data } = client.storage.from('pet-media').getPublicUrl(path);
      return data?.publicUrl || null;
    }
  } catch (e) {}
  // fallback
  return 'https://opwwsrpsqiojghaxjqmr.supabase.co/storage/v1/object/public/pet-media/' + path;
}

// 전역 노출
window.formatDate = formatDate;
window.formatFileSize = formatFileSize;
window.PLAN_LIMITS = PLAN_LIMITS;
window.getPublicUrl = getPublicUrl;
