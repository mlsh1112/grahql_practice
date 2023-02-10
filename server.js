import { ApolloServer, gql } from "apollo-server";
import fetch from "node-fetch";

let tweets = [
    {
        id: '1',
        text: 'first one',
        userId: '2'
    },
    {
        id: '2',
        text: 'second one',
        userId: '1'
    }
]

let users = [
    {
        id: '1',
        firstName : 'suzy',
        lastName: 'kim'
    },
    {
        id: '2',
        firstName : 'sua',
        lastName: 'lee'
    }
]

const typeDefs = gql`
    type User {
        id: ID!,
        username : String!,
        firstName : String!,
        lastName: String,
        """
        Is the sum of firstName + lastName as a string
        """
        fullName: String!
    }
    """
    TweetTweet
    """
    type Tweet {
        id: ID!,
        text: String!,
        author : User
    }

    type Query {
        allUsers : [User!]!
        allTweets : [Tweet!]!
        allMovies : [Movie!]!
        tweet(id:ID!): Tweet
        movie(id:ID!): Movie
    }

    type Mutation {
        postTweet(text: String!, userId:ID!): Tweet!
        """
        Deletes a Tweet if found, else return false
        """
        deleteTweet(id:ID!) : Boolean!
    },
    type Movie {
        id: Int!
        url: String!
        imdb_code: String!
        title: String!
        title_english: String!
        title_long: String!
        slug: String!
        year: Int!
        rating: Float!
        runtime: Float!
        genres: [String]!
        summary: String
        description_full: String!
        synopsis: String
        yt_trailer_code: String!
        language: String!
        background_image: String!
        background_image_original: String!
        small_cover_image: String!
        medium_cover_image: String!
        large_cover_image: String!
    }

`;
// POST, PUT, DELETE => Mutation
// required : !

const resolvers = {
    Query:{
        allUsers(){
            return users;
        },
        allTweets(){
            return tweets;
        },
        allMovies(){
            return fetch("https://yts.mx/api/v2/list_movies.json")
            .then(res=> res.json())
            .then(json=> json.data.movies)
        },
        tweet(root, {id}){
            return tweets.find((tweet)=> tweet.id === id);
        },
        movie(_, {id}){
            console.log(id)
            return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
            .then(res=> res.json())
            .then(json=> json.data.movie)
        }
    },
    Mutation:{
        postTweet(_, {text, userId}){
            const newTweet = {
                id : tweets.length + 1,
                text
            };
            tweets.push(newTweet);
            return newTweet;
        },
        deleteTweet(_, {id}){
            const tweet = tweets.find(tweet => tweet.id === id);
            console.log(tweet, id)
            if(!tweet) return false;
            tweets = tweets.filter(tweet => tweet.id !== id);
            return true
        },

    },
    User : {
        fullName({firstName, lastName}){
            return `${firstName} ${lastName}`;
        }
    },
    Tweet : {
        author({userId}){
            return users.find(user => userId === user.id)
        }
    }
}

const server = new ApolloServer({typeDefs, resolvers});


server.listen().then(({url})=>{
    console.log(`Running on ${url}`)
})