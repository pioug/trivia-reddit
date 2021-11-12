import { Component, h, render } from "preact";
import { DEFAULT_SUBREDDITS } from "./constants.js";

chrome.storage.sync.get("subreddits", (obj) => {
  const subreddits =
    obj.subreddits && obj.subreddits.length
      ? obj.subreddits
      : DEFAULT_SUBREDDITS;

  if (!obj.subreddits || !obj.subreddits.length) {
    chrome.storage.sync.set({ subreddits });
  }

  render(
    <RedditTrivia subreddits={subreddits} />,
    document.getElementById("app")
  );
});

class RedditTrivia extends Component {
  constructor(props) {
    const rand = Math.floor(Math.random() * props.subreddits.length);
    const subreddit = props.subreddits[rand];
    super();

    if (localStorage.post) {
      this.state = { post: JSON.parse(localStorage.post) };
      localStorage.post = null;
    } else {
      this.state = {};
    }

    fetch(`https://www.reddit.com${subreddit}.json`)
      .then((response) => response.json())
      .then((json) => {
        const posts = json.data.children;
        const rand = Math.floor(Math.random() * posts.length);
        const post = posts[rand];
        const postNext = posts[rand];
        localStorage.post = JSON.stringify({
          url: postNext.data.url,
          title: postNext.data.title,
          subreddit: postNext.data.subreddit,
          permalink: postNext.data.permalink,
        });

        if (!this.state.post) {
          this.setState({ post: post.data });
        }
      })
      .catch(() => {
        if (!navigator.onLine) {
          this.setState({
            post: {
              title: "There is no Internet connection 🙉",
            },
          });
          return;
        }
      });
  }
  render() {
    const post = this.state.post || {};
    return (
      <main>
        <header>
          <h1>
            <a href={post.url}>{post.title}</a>
          </h1>
        </header>
        <footer>
          {post.subreddit && (
            <h2>
              <a href={`https://www.reddit.com${post.permalink}`}>
                /r/{post.subreddit}
              </a>
            </h2>
          )}
        </footer>
      </main>
    );
  }
}
