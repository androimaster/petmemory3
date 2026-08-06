// 유틸리티 함수

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr.replace(/-/g, '.');
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const PLAN_LIMITS = {
  free: {
    maxPets: 1,
    maxStorage: 1 * 1024 * 1024 * 1024,
    label: '별빛 무료'
  },
  plus: {
    maxPets: 10,
    maxStorage: 20 * 1024 * 1024 * 1024,
    label: '별빛 플러스'
  }
};

/**
 * Signed URL 생성 (Private 버킷용)
 * @param {string} path
 * @param {number} expiresIn 초 단위 (기본 7일)
 */
async function getSignedUrl(path, expiresIn = 60 * 60 * 24 * 7) {
  if (!path) return null;

  try {
    const client = (typeof getSupabase === 'function' ? getSupabase() : null) || (typeof supabase !== 'undefined' ? supabase : null);
    if (!client || !client.storage) {
      console.warn('Supabase client not ready');
      return null;
    }

    const { data, error } = await client.storage
      .from('pet-media')
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('Signed URL 생성 실패:', error);
      return null;
    }
    return data?.signedUrl || null;
  } catch (e) {
    console.error('getSignedUrl error:', e);
    return null;
  }
}

// 기존 이름 호환 (이제 Promise를 반환합니다)
function getPublicUrl(path) {
  return getSignedUrl(path);
}

window.formatDate = formatDate;
window.formatFileSize = formatFileSize;
window.PLAN_LIMITS = PLAN_LIMITS;
window.getSignedUrl = getSignedUrl;
window.getPublicUrl = getPublicUrl;
