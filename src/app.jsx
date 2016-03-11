'use strict';

import React from 'react';
import { render } from 'react-dom';

const backgroundColors = [
  '#EF5350',
  '#F06292',
  '#9575CD',
  '#40C4FF',
  '#26A69A',
  '#8BC34A',
  '#26C6DA',
  '#607D8B',
  '#FF5722',
  '#6D4C41'
];

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
    let style = {
      backgroundColor: backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
    };

    console.log(post.title);
    return (
      <main>
        <header style={style}>
          <h1><a href={post.url} dangerouslySetInnerHTML={ { __html: post.title } }></a></h1>
        </header>
        <footer>
          <h2><a href={'https://www.reddit.com' + post.permalink}>/r/{post.subreddit}</a></h2>
        </footer>
      </main>
    );
  }
}

render(
  <RedditTrivia />,
  document.getElementById('main')
);
