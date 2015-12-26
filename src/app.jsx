'use strict';

class RedditTrivia extends React.Component {
  constructor() {
    let subreddits = ['askscience', 'explainlikeimfive', 'todayilearned'];
    let rand = Math.floor(Math.random() * subreddits.length)
    let subreddit = subreddits[rand];
    super();

    if (localStorage.post) {
      this.state = { post: JSON.parse(localStorage.post) };
      localStorage.post = null;
    } else {
      this.state = {};
    }

    fetch('https://www.reddit.com/r/' + subreddit + '.json')
      .then((response) => response.json())
      .then((json) => {
        let posts = json.data.children;
        let rand = Math.floor(Math.random() * posts.length);
        let post = posts[rand];
        let randNext = Math.floor(Math.random() * posts.length);
        let postNext = posts[rand];
        localStorage.post = JSON.stringify({
          url : postNext.data.url,
          title: postNext.data.title,
          subreddit: postNext.data.subreddit,
          permalink: postNext.data.permalink
        });

        if (!this.state.post) {
          this.setState({ post: post.data });
        }
      });
  }
  render() {
    let post = this.state.post || {};
    console.log(post.title);
    return (
      <main>
        <a className="anchor-background" href={post.url}><h1 dangerouslySetInnerHTML={ { __html: post.title } }></h1></a>
        <h2><a href={'https://www.reddit.com' + post.permalink}>/r/{post.subreddit}</a></h2>
      </main>
    );
  }
}

ReactDOM.render(
  <RedditTrivia />,
  document.getElementById('main')
);
