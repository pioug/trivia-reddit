import { DEFAULT_SUBREDDITS } from "./constants.js";

const errored = new URLSearchParams(location.search).get("subreddit");
const SUBREDDITS_CACHE_KEY = "subreddits";
const form = document.forms[0];
const input = form[0];
const list = document.querySelector("ul");
const state = {
  deletedSubreddits: [],
  subreddits: [],
};

form.addEventListener("submit", (evt) => {
  evt.preventDefault();
  addSubreddit(input.value.trim());
});

chrome.storage.sync.get("subreddits", (obj) => {
  const subreddits =
    obj.subreddits && obj.subreddits.length
      ? obj.subreddits
      : DEFAULT_SUBREDDITS;

  if (!obj.subreddits || !obj.subreddits.length) {
    chrome.storage.sync.set({ subreddits });
  }

  state.subreddits = subreddits;
  cacheSubreddits(subreddits);
  render();
});

function cacheSubreddits(subreddits) {
  localStorage.setItem(SUBREDDITS_CACHE_KEY, JSON.stringify(subreddits));
}

function saveSubreddits(subreddits) {
  cacheSubreddits(subreddits);
  chrome.storage.sync.set({ subreddits });
}

function render() {
  list.textContent = "";

  for (const subreddit of state.subreddits) {
    const li = document.createElement("li");
    if (subreddit === errored) {
      li.className = "errored";
    }

    const label = document.createElement("label");
    if (state.deletedSubreddits.includes(subreddit)) {
      label.className = "deleted";
    }

    const subredditLink = document.createElement("a");
    subredditLink.href = `https://www.reddit.com${subreddit}`;
    subredditLink.textContent = subreddit;
    label.append(subredditLink);

    li.append(label, createAction(subreddit));
    list.append(li);
  }
}

function createAction(subreddit) {
  const action = document.createElement("a");
  const isDeleted = state.deletedSubreddits.includes(subreddit);
  action.className = isDeleted ? "undo" : "delete";
  action.textContent = isDeleted ? "undo" : "x";
  action.onclick = () => {
    if (isDeleted) {
      undoDelete(subreddit);
    } else {
      deleteSubreddit(subreddit);
    }
  };

  return action;
}

function addSubreddit(subreddit) {
  if (!/\/r\/.+/.test(subreddit)) {
    alert("Must start with /r/");
    return;
  }

  if (state.subreddits.includes(subreddit)) {
    alert("Already added");
    return;
  }

  input.value = "";
  state.subreddits = state.subreddits.concat(subreddit);
  persistActiveSubreddits();
  render();
}

function deleteSubreddit(subreddit) {
  state.deletedSubreddits = state.deletedSubreddits.concat(subreddit);
  persistActiveSubreddits();
  render();
}

function undoDelete(subreddit) {
  state.deletedSubreddits = state.deletedSubreddits.filter(
    (deletedSubreddit) => deletedSubreddit !== subreddit,
  );
  persistActiveSubreddits();
  render();
}

function persistActiveSubreddits() {
  saveSubreddits(
    state.subreddits.filter(
      (subreddit) => !state.deletedSubreddits.includes(subreddit),
    ),
  );
}
