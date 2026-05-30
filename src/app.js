import { DEFAULT_SUBREDDITS } from "./constants.js";

const POST_CACHE_KEY = "post";
const SUBREDDITS_CACHE_KEY = "subreddits";

const titleLink = document.getElementById("title-link");
const subredditHeading = document.getElementById("subreddit-heading");
const subredditLink = document.getElementById("subreddit-link");

const cachedPost = readCachedJson(POST_CACHE_KEY);
const cachedSubreddits = normalizeSubreddits(readCachedJson(SUBREDDITS_CACHE_KEY));

if (cachedPost) {
  renderPost(cachedPost);
}

if (cachedSubreddits) {
  scheduleNextPost(cachedSubreddits);
  setTimeout(refreshSubredditsCache);
} else {
  chrome.storage.sync.get("subreddits", (obj) => {
    const subreddits = normalizeSubreddits(obj.subreddits) || DEFAULT_SUBREDDITS;

    if (!obj.subreddits || !obj.subreddits.length) {
      chrome.storage.sync.set({ subreddits });
    }

    writeCachedJson(SUBREDDITS_CACHE_KEY, subreddits);
    fetchNextPost(subreddits);
  });
}

function scheduleNextPost(subreddits) {
  setTimeout(() => fetchNextPost(subreddits));
}

function refreshSubredditsCache() {
  chrome.storage.sync.get("subreddits", (obj) => {
    const subreddits = normalizeSubreddits(obj.subreddits);

    if (subreddits) {
      writeCachedJson(SUBREDDITS_CACHE_KEY, subreddits);
    }
  });
}

function fetchNextPost(subreddits) {
  const subreddit = pickRandom(subreddits);

  fetch(`https://api.reddit.com${subreddit}.json?raw_json=1`)
    .then((response) => response.json())
    .then((json) => {
      const posts = json.data.children;
      const post = pickRandom(posts).data;
      const nextPost = {
        url: post.url,
        title: post.title,
        subreddit: post.subreddit,
        permalink: post.permalink,
      };

      writeCachedJson(POST_CACHE_KEY, nextPost);

      if (!cachedPost) {
        renderPost(nextPost);
      }
    })
    .catch(() => {
      if (!navigator.onLine && !cachedPost) {
        renderPost({
          title: "There is no Internet connection 🙉",
        });
      }
    });
}

function renderPost(post) {
  titleLink.textContent = post.title || "";

  if (post.url) {
    titleLink.href = post.url;
  } else {
    titleLink.removeAttribute("href");
  }

  if (post.subreddit && post.permalink) {
    subredditLink.href = `https://www.reddit.com${post.permalink}`;
    subredditLink.textContent = `/r/${post.subreddit}`;
    subredditHeading.hidden = false;
  } else {
    subredditHeading.hidden = true;
    subredditLink.removeAttribute("href");
    subredditLink.textContent = "";
  }
}

function normalizeSubreddits(subreddits) {
  return Array.isArray(subreddits) && subreddits.length ? subreddits : null;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function readCachedJson(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

function writeCachedJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
