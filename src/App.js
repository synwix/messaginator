import React, { useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
/*import 'firebase/analytics';*/

import {useAuthState} from 'react-firebase-hooks/auth';
import {useCollectionData} from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyAugIiNWRng_Tx4rUg-dtfkopvZtoLnW44",
  authDomain: "messaginator.firebaseapp.com",
  databaseURL: "https://messaginator-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "messaginator",
  storageBucket: "messaginator.appspot.com",
  messagingSenderId: "187896720583",
  appId: "1:187896720583:web:f45c9b9e520086ae94a2e2",
  measurementId: "G-BEN61FT9CH"
})

const auth = firebase.auth()
const firestore = firebase.firestore();
/*const analytics = firebase.analytics();*/

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Messaginator</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );/* if user is defined, go to chatroom. Otherwise, show the sign in component*/
}


function SignIn (){
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  } /*instantiating provider*/


  return(
    <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut (){
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const dummy = useRef();
  const messagesRef = firestore.collection('messages'); /*referance to database*/
  const query = messagesRef.orderBy('createdAt').limit(25); /*query for timestamp*/

  const [messages] = useCollectionData(query, {idField:  'id'});

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault(); /*to prevent page refreshing*/

    const {uid, photoURL} = auth.currentUser; /*grabbing the userid and their photo from the currently logged user*/

    await messagesRef.add({ /*writes new document to the database, giving the values to write to the database*/
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');/*resetting the form value back to an empty string*/

    dummy.current.scrollIntoView({behavior: 'smooth'}); /*auto scroll to the bottom after every message submit */

  }
  /*this listens to the on-submit event*/


  /*listening to updates in data in real time*/
  return(
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key ={msg.id} message={msg} /> )}

        <div ref={dummy}></div>

      </main>
      <form onSubmit={sendMessage}>
        <input value = {formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type = "submit">Send</button>
      </form>

    </>
  )/*UI for the user to send a message by adding a form and a button to submit the message 
  *whenever the user types into the form it triggers the change event
  */
}

function ChatMessage(props){
  const {text, uid, phototURL} = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';

  return(
    <div className={`message ${messageClass}`}>
      <img src={phototURL} alt="description" />
      <p>{text}</p>
    </div>
  )
}/*to distinguish if the message was sent or recieved by comparing the userid on the firestore document to currnetly logged user
*also applying styling based on wether the message was sent or recieved */
/*each message is a document in the firestore database, containing the text, userid and timestamp for a given message*/
/* whenever the underlying data changes in the back-end, the react app will update with the most recent messages on the front-end*/
export default App;
