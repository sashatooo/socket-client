import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/Chat.module.css";
import EmojiPicker from "emoji-picker-react";
import icon from "../images/icon.svg";
import Messages from "./Messages";

const socket = io.connect("http://localhost:5000");

const Chat = () => {
  const { search } = useLocation();
  const navigate = useNavigate()
  const [params, setParams] = useState({ user: "", room: "" });
  const [state, setState] = useState([]);
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState(0)


  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(search));
    setParams(searchParams);
    socket.emit("join", searchParams);
  }, [search]);

  useEffect(() => {
    socket.on("message", ({ data }) => {
      setState((_state) => [..._state, data]);
    });
  }, []);

  useEffect(() => {
    socket.on("joinRoom", ({ data: {users} }) => {
      setUsers(users.length)
    });
  }, []);

  const leftRoom = () => {
    socket.emit('leftRoom', {params})
    navigate('/')
  };
  const handleChange = ({ target: { value } }) => {
    setMessage(value);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message) return;
    socket.emit("sendMessage", { message, params });
    setMessage("");
  };

  const onEmojiClick = ({ emoji }) => {
    setMessage(`${message} ${emoji}`);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>{params.room}</div>
        <div className={styles.users}>{users} users in this room</div>
        <button className={styles.left} onClick={leftRoom}>
          Left the room
        </button>
      </div>
      <div className={styles.messages}>
        <Messages messages={state} name={params.name} />
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.input}>
          <input
            type="text"
            name="message"
            value={message}
            placeholder="What do you want to say?"
            onChange={handleChange}
            autoComplete="off"
            required
          />
        </div>
        <div className={styles.emoji} onClick={() => setIsOpen(!isOpen)}>
          <img src={icon} alt="" />
          {isOpen && (
            <div className={styles.emojies}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
        <div className={styles.button}>
          <input
            type="submit"
            onSubmit={handleSubmit}
            value="Send a message"
          ></input>
        </div>
      </form>
    </div>
  );
};

export default Chat;
