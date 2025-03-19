import React, { useState, useEffect } from "react";
import "./ChatViewer.css";

const ChatViewer = () => {
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loadingTime, setLoadingTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fileLoaded, setFileLoaded] = useState(false);

  const handleLoadChat = () => {
    if (!startDate || !endDate) {
      alert("Please enter both start and end dates.");
      return;
    }
    
    const filePath = "/extra/WhatsApp Chat with Sudarshan.txt";
    const startTime = Date.now();
    
    fetch(filePath)
      .then((response) => response.text())
      .then((text) => {
        const lines = text.split("\n");
        let chatData = [];
        
        lines.forEach((line, index) => {
          setTimeout(() => {
            const currentProgress = ((index / lines.length) * 100).toFixed(2);
            setProgress(currentProgress);
            
            let dateMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{2})/);
            let messageDate = dateMatch ? `20${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : "";
            
            if (!messageDate || messageDate < startDate || messageDate > endDate) return;
            
            const messageElement = {};
            let senderName = '';
            let isSharanya = false;
            
            if (line.includes("Sudarshan")) {
              senderName = 'Sudarshan';
              isSharanya = false;
            } else if (line.includes("Sharanya")) {
              senderName = 'Sharanya';
              isSharanya = true;
            }
            
            const mediaMatch = line.match(/(IMG-|VID-|PTT-|STK-).*?\.(jpg|png|webp|mp4|opus|gif|pdf)/i);
            if (mediaMatch) {
              const mediaFile = mediaMatch[0];
              const fileExt = mediaMatch[2].toLowerCase();
              const filePath = `/extra/media/${mediaFile}`;
              
              if (["jpg", "png", "webp", "gif"].includes(fileExt)) {
                messageElement.type = "file";
                messageElement.content = (
                  <div data-date={messageDate}>
                    <span className="sender-name">{senderName}</span>
                    <img src={filePath} className="media" alt="Media" onError={(e) => e.target.style.display = 'none'} />
                  </div>
                );
              } else if (["mp4"].includes(fileExt)) {
                messageElement.type = "file";
                messageElement.content = (
                  <div data-date={messageDate}>
                    <span className="sender-name">{senderName}</span>
                    <video className="media" controls>
                      <source src={filePath} type="video/mp4" />
                    </video>
                  </div>
                );
              } else if (["opus"].includes(fileExt)) {
                messageElement.type = "file";
                messageElement.content = (
                  <div data-date={messageDate}>
                    <span className="sender-name">{senderName}</span>
                    <audio className="media" controls>
                      <source src={filePath} type="audio/ogg" />
                    </audio>
                  </div>
                );
              } else if (["pdf"].includes(fileExt)) {
                messageElement.type = "file";
                messageElement.content = (
                  <div data-date={messageDate}>
                    <span className="sender-name">{senderName}</span>
                    <a href={filePath} target="_blank" rel="noopener noreferrer" className="file">
                      📄 View PDF
                    </a>
                  </div>
                );
              }
            } else {
              messageElement.type = "text";
              messageElement.content = (
                <div data-date={messageDate}>
                  <span className="sender-name">{senderName}</span>
                  {line}
                </div>
              );
            }
            
            chatData.push({ messageElement, isSharanya, date: messageDate });
            setMessages([...chatData]);
          }, index * 20);
        });
      })
      .catch((error) => console.error("Error loading chat:", error));
    
    setFileLoaded(true);
  };
  
  return (
    <div className="chat-viewer">
      <div className="date-selection">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleLoadChat}>Load</button>
      </div>
      
      {fileLoaded && (
        <>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="chat-container">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.isSharanya ? "sent" : "received"}`} data-date={message.date}>
                {message.messageElement.content}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatViewer;
