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

const backgroundColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)]

class RedditTrivia extends React.Component {
  constructor() {
    const subreddits = ['askscience', 'explainlikeimfive', 'todayilearned'];
    const rand = Math.floor(Math.random() * subreddits.length)
    const subreddit = subreddits[rand];
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
        const posts = json.data.children;
        const rand = Math.floor(Math.random() * posts.length);
        const post = posts[rand];
        const randNext = Math.floor(Math.random() * posts.length);
        const postNext = posts[rand];
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
    const post = this.state.post || {};
    const style = { backgroundColor };

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

window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var n=t.forceSSL||"https:"===document.location.protocol,a=document.createElement("script");a.type="text/javascript",a.async=!0,a.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(a,o);for(var r=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["clearEventProperties","identify","setEventProperties","track","unsetEventProperty"],c=0;c<p.length;c++)heap[p[c]]=r(p[c])};
heap.load("973980036", { forceSSL: true });
