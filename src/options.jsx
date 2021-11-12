import { Component, h, render } from "preact";
import { parse } from "query-string";
import { DEFAULT_SUBREDDITS } from "./constants.js";

const errored = parse(location.search).subreddit;

chrome.storage.sync.get("subreddits", (obj) => {
  const subreddits =
    obj.subreddits && obj.subreddits.length
      ? obj.subreddits
      : DEFAULT_SUBREDDITS;

  if (!obj.subreddits || !obj.subreddits.length) {
    chrome.storage.sync.set({ subreddits });
  }

  render(
    <RedditTriviaOptions subreddits={subreddits} />,
    document.getElementById("app")
  );
});

class RedditTriviaOptions extends Component {
  constructor({ subreddits }) {
    super();
    this.setState({
      deletedSubreddits: [],
      inputValue: "",
      messages: [],
      subreddits,
    });
  }
  render() {
    const updateInputValue = (evt) => {
      this.setState({
        inputValue: evt.target.value,
      });
    };
    const onSubmit = (evt) => {
      const subreddit = this.state.inputValue.trim();
      evt.preventDefault();

      if (!/\/r\/.+/.test(subreddit)) {
        alert("Must start with /r/");
        return;
      }

      if (this.state.subreddits.includes(subreddit)) {
        alert("Already added");
        return;
      }

      this.setState({
        inputValue: "",
        subreddits: this.state.subreddits.concat(subreddit),
      });

      chrome.storage.sync.set({
        subreddits: this.state.subreddits.filter(
          (sr) => !this.state.deletedSubreddits.includes(sr)
        ),
      });

      setTimeout(() => this.textInput.focus());
    };
    const onDelete = (subreddit) => {
      this.setState({
        deletedSubreddits: this.state.deletedSubreddits.concat(subreddit),
      });
      chrome.storage.sync.set({
        subreddits: this.state.subreddits.filter(
          (sr) => !this.state.deletedSubreddits.includes(sr)
        ),
      });
    };
    const onUndo = (subreddit) => {
      this.setState({
        deletedSubreddits: this.state.deletedSubreddits.filter(
          (sr) => sr !== subreddit
        ),
      });
      chrome.storage.sync.set({
        subreddits: this.state.subreddits.filter(
          (sr) => !this.state.deletedSubreddits.includes(sr)
        ),
      });
    };
    const li = this.state.subreddits.map((subreddit, index) => {
      const action = this.state.deletedSubreddits.includes(subreddit) ? (
        <a class="undo" onClick={() => onUndo(subreddit)}>
          undo
        </a>
      ) : (
        <a class="delete" onClick={() => onDelete(subreddit)}>
          x
        </a>
      );
      return (
        <li key={index} className={subreddit === errored ? "errored" : ""}>
          <label
            className={
              this.state.deletedSubreddits.includes(subreddit) ? "deleted" : ""
            }
          >
            <a href={`https://www.reddit.com${subreddit}`}>{subreddit}</a>
          </label>
          {action}
        </li>
      );
    });
    return (
      <div class="list">
        <ul>{li}</ul>
        <form onSubmit={onSubmit}>
          <input
            ref={(input) => (this.textInput = input)}
            autofocus
            spellCheck="false"
            type="text"
            placeholder="/r/new_subreddit"
            value={this.state.inputValue}
            onChange={updateInputValue}
          />
          <button type="submit" class="add">
            ADD
          </button>
        </form>
      </div>
    );
  }
}
