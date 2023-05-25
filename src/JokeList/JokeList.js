import React, { useState, useEffect, Component } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends Component {
  static defaultProps = {numJokes : 10}

  constructor(props){
    super(props);
    this.state = { jokes : [] }
    this.generateNewJokes = this.generateNewJokes.bind(this);
    this.resetVotes = this.resetVotes.bind(this);
    this.toggleLock = this.toggleLock.bind(this);
    this.vote = this.vote.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
  }

  componentDidUpdate() {
    if (this.state.jokes.length < this.props.numJokesToGet) this.getJokes();
  }

  async retrieveJokes(){
    try{
      let jokes = this.state.jokes;
      let numVotes = JSON.parse(window.localStorage.getItem('jokeVotes') || '{}')
      let repeatJokes = new Set(jokes.map(joke => joke.id))

      while(jokes.length < this.props.numJokes){
        let res = await axios.get("https://icanhazdadjoke.com", { headers : {Accept : "application/json"}})
        let {status, ...joke} = res.data;

        if(!repeatJokes.has(joke.id)){
          repeatJokes.add(joke.id)
          numVotes[joke.id] = numVotes[joke.id] || 0;
          jokes.push({...joke, votes: numVotes[joke.id], locked: false})
        }
        else{
          console.log('dupe')
        }
      }
      this.setState({jokes});
      window.localStorage.setItem('jokeVotes',JSON.stringify(numVotes))
    }
    catch(e){
      console.log(e)
    }
  }
  generateNewJokes(){
    this.setState(st => ({jokes: st.jokes.filter(joke => joke.locked)}))
  }

  resetVotes(){
    window.localStorage.setItem('jokeVotes', '{}')
    this.setState(st => ({jokes: st.jokes.map(joke => ({ ...joke, votes: 0 }))}))
  }

  vote(id,delta){
    let jokeVotes = JSON.parse(window.localStorage.getItem('jokeVotes'))
    jokeVotes[id] = (jokeVotes[id] || 0 ) + delta;
    window.localStorage.setItem('jokeVotes', JSON.stringify(jokeVotes))
    this.setState(st => ({
      jokes: st.jokes.map(j => j.id === id ? { ...j, votes: j.votes + delta } : j)
    }));
  }

  render(){
    return (
      <div className="JokeList">
        <button className="JokeList-getmore" onClick={this.generateNewJokes}>
          Get New Jokes
        </button>
        <button className="reset" onClick={this.resetVotes}>Reset Votes</button>
  
        {sortedJokes.map(j => (
          <Joke text={j.joke} key={j.id} id={j.id} votes={j.votes} vote={vote} />
        ))}
      </div>
    );
  }
}


export default JokeList;
