// utils/faviconService.js

// Constants
const CACHE_CONFIG = {
  MAX_SIZE: 100,
  STORAGE_KEY: 'faviconCache',
  VISIT_TRACKING_KEY: 'lastVisitedSite',
  VISIT_TIME_KEY: 'lastVisitTime',
  VISIT_TIMEOUT: 5 * 60 * 1000, // 5 minutes
};

const IMAGE_CONFIG = {
  VERIFICATION_TIMEOUT: 3000, // Increased from 2000ms
  ICON_SIZE: 64,
  FONT_SIZE: 32,
};

const FALLBACK_COLORS = [
  '#4285f4', '#ea4335', '#fbbc05', '#34a853',
  '#673ab7', '#ff6d00', '#2196f3', '#9c27b0',
];

// Cache management
let faviconCacheInstance = null;

const getFaviconCache = () => {
  if (!faviconCacheInstance) {
    try {
      faviconCacheInstance = JSON.parse(
        localStorage.getItem(CACHE_CONFIG.STORAGE_KEY) || '{}'
      );
    } catch (error) {
      console.error('Failed to parse favicon cache:', error);
      faviconCacheInstance = {};
    }
  }
  return faviconCacheInstance;
};

const saveFaviconCache = () => {
  try {
    localStorage.setItem(CACHE_CONFIG.STORAGE_KEY, JSON.stringify(faviconCacheInstance));
  } catch (error) {
    console.error('Failed to save favicon cache:', error);
  }
};

// 从URL中提取域名信息
const extractDomainInfo = (url) => {
  try {
    const urlObj = new URL(url);
    return {
      origin: urlObj.origin,
      hostname: urlObj.hostname,
      protocol: urlObj.protocol,
      host: urlObj.host,
    };
  } catch (error) {
    console.error('无法解析URL:', url, error);
    return null;
  }
};

// 验证图像URL是否有效 (基于HTTP响应代码)
const verifyImageUrl = (url, timeout = IMAGE_CONFIG.VERIFICATION_TIMEOUT) => {
  return new Promise((resolve) => {
    // 使用AbortController来处理超时
    const controller = new AbortController();
    const signal = controller.signal;
    
    // 设置超时
    const timeoutId = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, timeout);
    
    fetch(url, {
      method: 'HEAD', // 只获取头信息，不下载实际内容
      signal,
      cache: 'no-store', // 避免缓存问题
      credentials: 'omit' // 不发送凭证
    })
    .then(response => {
      clearTimeout(timeoutId);
      // 检查HTTP响应代码，2xx表示成功
      resolve(response.ok);
    })
    .catch(() => {
      clearTimeout(timeoutId);
      resolve(false);
    });
  });
};
// 从本地存储中获取缓存的图标 (优化版本)
const getCachedFavicon = (url) => {
  try {
    const faviconCache = getFaviconCache();

    // 尝试获取精确匹配
    if (faviconCache[url]) {
      return faviconCache[url];
    }

    // 如果没有精确匹配，尝试查找相同域名的其他条目
    const domainInfo = extractDomainInfo(url);
    if (domainInfo) {
      const { hostname } = domainInfo;
      
      // 使用 Object.entries 提高性能
      for (const [cachedUrl, faviconUrl] of Object.entries(faviconCache)) {
        try {
          const cachedUrlInfo = extractDomainInfo(cachedUrl);
          if (cachedUrlInfo && cachedUrlInfo.hostname === hostname) {
            return faviconUrl;
          }
        } catch (e) {
          // 忽略解析错误，继续查找
        }
      }
    }

    return null;
  } catch (error) {
    console.error('获取缓存图标失败:', error);
    return null;
  }
};

// 将图标URL缓存到本地存储 (优化版本)
const cacheFavicon = (url, faviconUrl) => {
  if (!url || !faviconUrl) return;
  
  try {
    const faviconCache = getFaviconCache();
    faviconCache[url] = faviconUrl;

    // 限制缓存大小，使用 LRU 策略
    const keys = Object.keys(faviconCache);
    if (keys.length > CACHE_CONFIG.MAX_SIZE) {
      // 删除最旧的条目
      const keysToRemove = keys.slice(0, keys.length - CACHE_CONFIG.MAX_SIZE);
      keysToRemove.forEach((key) => delete faviconCache[key]);
    }

    // 批量保存，减少 localStorage 操作
    saveFaviconCache();
  } catch (error) {
    console.error('缓存图标失败:', error);
    // 如果缓存失败，重置缓存实例
    faviconCacheInstance = null;
  }
};

// 生成字母图标的数据URL (优化版本)
const generateLetterIconDataUrl = (letter, backgroundColor = FALLBACK_COLORS[0]) => {
  try {
    // 创建Canvas元素
    const canvas = document.createElement('canvas');
    const size = IMAGE_CONFIG.ICON_SIZE;
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取 Canvas 2D 上下文');
    }

    // 绘制背景 (圆形)
    ctx.fillStyle = backgroundColor;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();

    // 绘制字母
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${IMAGE_CONFIG.FONT_SIZE}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const displayLetter = letter.toUpperCase();
    ctx.fillText(displayLetter, size / 2, size / 2);

    // 将Canvas转换为Data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('生成字母图标失败:', error);
    return null;
  }
};

// 从公共服务获取favicon (优化版本)
const getFaviconFromPublicServices = async (url) => {
  try {
    const domainInfo = extractDomainInfo(url);
    if (!domainInfo) return null;

    const { hostname } = domainInfo;
    const encodedHostname = encodeURIComponent(hostname);

    // 尝试多个公共favicon服务 (按可靠性排序)
    const publicServices = [
      // Google的favicon服务 - 最可靠
      `https://www.google.com/s2/favicons?domain=${encodedHostname}&sz=${IMAGE_CONFIG.ICON_SIZE}`,
      
      // Favicon.ico 服务
      `https://icon.horse/icon/${encodedHostname}`,
      
      // DuckDuckGo的favicon服务 - 较为隐私
      `https://external-content.duckduckgo.com/ip3/${encodedHostname}.ico`,

      // Yandex的favicon服务
      `https://favicon.yandex.net/favicon/${encodedHostname}`,
    ];

    // 并发验证前两个最可靠的服务，其余按顺序验证
    const primaryServices = publicServices.slice(0, 2);
    const fallbackServices = publicServices.slice(2);

    // 并发验证主要服务
    const primaryPromises = primaryServices.map(async (serviceUrl) => {
      try {
        const isValid = await verifyImageUrl(serviceUrl, 2000); // 更短的超时
        return isValid ? serviceUrl : null;
      } catch (e) {
        return null;
      }
    });

    const primaryResults = await Promise.allSettled(primaryPromises);
    for (const result of primaryResults) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }

    // 如果主要服务失败，依次尝试备选服务
    for (const serviceUrl of fallbackServices) {
      try {
        const isValid = await verifyImageUrl(serviceUrl);
        if (isValid) {
          return serviceUrl;
        }
      } catch (e) {
        // 继续尝试下一个服务
      }
    }

    return null;
  } catch (error) {
    console.error('从公共服务获取图标失败:', error);
    return null;
  }
};

// 直接从网站获取favicon (优化版本)
// 直接从网站获取favicon (增强版本)
const getFaviconDirectlyFromWebsite = async (url) => {
  try {
    const domainInfo = extractDomainInfo(url);
    if (!domainInfo) return null;

    const { origin } = domainInfo;

    // 1. 首先尝试从HTML中提取favicon链接
    try {
      // 获取网页HTML内容
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html',
        },
        credentials: 'omit',
        cache: 'no-store',
        timeout: 5000
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // 创建DOM解析器
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 按优先级排序的链接选择器数组
        const selectors = [
          // Apple Touch Icons (通常质量最高)
          'link[rel="apple-touch-icon-precomposed"][href]',
          'link[rel="apple-touch-icon"][href]',
          
          // 标准图标 - 按大小排序
          'link[rel="icon"][sizes="192x192"][href]',
          'link[rel="icon"][sizes="128x128"][href]',
          'link[rel="icon"][sizes="96x96"][href]',
          'link[rel="icon"][sizes="64x64"][href]',
          'link[rel="icon"][sizes="32x32"][href]',
          'link[rel="shortcut icon"][href]',
          'link[rel="icon"][href]',
          
          // 其他类型的图标
          'link[rel="fluid-icon"][href]',
          'link[rel="mask-icon"][href]',
          
          // SVG图标（可扩展矢量图形，质量通常很好）
          'link[rel="icon"][type="image/svg+xml"][href]',
        ];
        
        // 遍历选择器，寻找匹配的元素
        for (const selector of selectors) {
          const linkElement = doc.querySelector(selector);
          if (linkElement && linkElement.getAttribute('href')) {
            let iconUrl = linkElement.getAttribute('href');
            
            // 处理相对URL
            if (iconUrl.startsWith('/')) {
              iconUrl = `${origin}${iconUrl}`;
            } else if (!iconUrl.startsWith('http')) {
              // 处理相对路径（不以/开头）
              const urlObj = new URL(url);
              const pathWithoutFilename = urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1);
              iconUrl = `${origin}${pathWithoutFilename}${iconUrl}`;
            }
            
            // 验证找到的图标是否可访问
            const isValid = await verifyImageUrl(iconUrl);
            if (isValid) {
              return iconUrl;
            }
          }
        }
      }
    } catch (error) {
      console.error('从HTML提取图标失败:', error);
      // 如果提取失败，继续尝试常见路径
    }

    // 2. 如果从HTML提取失败，尝试常见的图标路径
    // 为不同的可能位置生成图标URL (按优先级排序)
    const iconPaths = [
      // 最常见的标准位置
      `${origin}/favicon.ico`,
      `${origin}/favicon.png`,
      `${origin}/favicon.svg`,
      
      // Apple Touch 图标 (高质量)
      `${origin}/apple-touch-icon.png`,
      `${origin}/apple-touch-icon-precomposed.png`,
      
      // 静态资源常见位置
      `${origin}/static/favicon.ico`,
      `${origin}/assets/favicon.ico`,
      `${origin}/assets/images/favicon.ico`,
      `${origin}/images/favicon.ico`,
      `${origin}/img/favicon.ico`,
      `${origin}/public/favicon.ico`,
    ];

    // 并发验证前3个最常见的路径
    const primaryPaths = iconPaths.slice(0, 3);
    const fallbackPaths = iconPaths.slice(3);

    // 并发验证主要路径
    const primaryPromises = primaryPaths.map(async (iconPath) => {
      try {
        const isValid = await verifyImageUrl(iconPath, 2500);
        return isValid ? iconPath : null;
      } catch (e) {
        return null;
      }
    });

    const primaryResults = await Promise.allSettled(primaryPromises);
    for (const result of primaryResults) {
      if (result.status === 'fulfilled' && result.value) {
        return result.value;
      }
    }

    // 如果主要路径失败，依次尝试备选路径
    for (const iconPath of fallbackPaths) {
      try {
        const isValid = await verifyImageUrl(iconPath);
        if (isValid) {
          return iconPath;
        }
      } catch (e) {
        // 继续尝试下一个路径
      }
    }

    return null;
  } catch (error) {
    console.error('直接从网站获取图标失败:', error);
    return null;
  }
};

// 尝试获取网站图标 (优先使用公共服务)
const getFavicon = async (url) => {
  // 1. 检查缓存
  const cachedFavicon = getCachedFavicon(url);
  if (cachedFavicon) {
    // 验证缓存的图标是否仍然有效
    try {
      const isValid = await verifyImageUrl(cachedFavicon);
      if (isValid) {
        return cachedFavicon;
      }
    } catch (e) {
      // 忽略验证错误，继续尝试获取新图标
    }
  }

  // 2. 优先使用公共favicon服务
  try {
    const publicServiceFavicon = await getFaviconFromPublicServices(url);
    if (publicServiceFavicon) {
      cacheFavicon(url, publicServiceFavicon);
      return publicServiceFavicon;
    }
  } catch (error) {
    console.error("从公共服务获取图标失败:", error);
  }

  // 3. 如果公共服务失败，尝试直接从网站获取
  try {
    const directFavicon = await getFaviconDirectlyFromWebsite(url);
    if (directFavicon) {
      cacheFavicon(url, directFavicon);
      return directFavicon;
    }
  } catch (error) {
    console.error("直接从网站获取图标失败:", error);
  }

  // 4. 如果以上都失败，使用第一个字母生成数据URL作为图标
  try {
    const domainInfo = extractDomainInfo(url);
    if (domainInfo) {
      const { hostname } = domainInfo;
      const firstLetter = hostname.charAt(0).toUpperCase();

      // 根据域名生成一致的颜色
      const colors = [
        "#4285f4",
        "#ea4335",
        "#fbbc05",
        "#34a853",
        "#673ab7",
        "#ff6d00",
        "#2196f3",
      ];
      const colorIndex =
        hostname.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        colors.length;

      const letterIconUrl = generateLetterIconDataUrl(
        firstLetter,
        colors[colorIndex]
      );
      if (letterIconUrl) {
        cacheFavicon(url, letterIconUrl);
        return letterIconUrl;
      }
    }
  } catch (error) {
    console.error("生成字母图标失败:", error);
  }

  // 所有尝试都失败了，返回null
  return null;
};

// 记录用户点击的快捷方式
const trackVisitedSite = (url) => {
  try {
    // 存储最近访问的网站信息
    localStorage.setItem("lastVisitedSite", url);
    localStorage.setItem("lastVisitTime", Date.now().toString());
  } catch (error) {
    console.error("记录访问信息失败:", error);
  }
};

// 检查并获取上次访问的网站图标
const checkLastVisitedSite = async () => {
  try {
    const lastVisitedSite = localStorage.getItem("lastVisitedSite");
    const lastVisitTime = localStorage.getItem("lastVisitTime");

    if (!lastVisitedSite || !lastVisitTime) return null;

    // 检查是否在短时间内返回（表示用户可能访问了网站并返回）
    const currentTime = Date.now();
    const timeDiff = currentTime - parseInt(lastVisitTime, 10);

    // 如果用户在短时间内返回（例如5分钟内），尝试直接从网站获取图标
    // 这可能会绕过一些限制，因为用户刚刚访问过该站点
    if (timeDiff < 5 * 60 * 1000) {
      // 清除记录，避免重复处理
      localStorage.removeItem("lastVisitedSite");
      localStorage.removeItem("lastVisitTime");

      try {
        // 直接从网站获取图标（优先），因为用户刚刚访问过
        const directFavicon = await getFaviconDirectlyFromWebsite(
          lastVisitedSite
        );
        if (directFavicon) {
          cacheFavicon(lastVisitedSite, directFavicon);
          return { url: lastVisitedSite, faviconUrl: directFavicon };
        }

        // 如果直接获取失败，再尝试公共服务
        const publicServiceFavicon = await getFaviconFromPublicServices(
          lastVisitedSite
        );
        if (publicServiceFavicon) {
          cacheFavicon(lastVisitedSite, publicServiceFavicon);
          return { url: lastVisitedSite, faviconUrl: publicServiceFavicon };
        }
      } catch (error) {
        console.error("获取最近访问网站图标失败:", error);
      }
    } else {
      // 如果时间太长，清除记录
      localStorage.removeItem("lastVisitedSite");
      localStorage.removeItem("lastVisitTime");
    }
  } catch (error) {
    console.error("检查上次访问网站失败:", error);
  }

  return null;
};

export {
  getFavicon,
  getCachedFavicon,
  cacheFavicon,
  trackVisitedSite,
  checkLastVisitedSite,
  generateLetterIconDataUrl,
};
