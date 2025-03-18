import React, { useState, useEffect } from "react";
import "./ChatViewer.css";

const ChatViewer = () => {
  const [messages, setMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loadingTime, setLoadingTime] = useState("");
  const [dateQuery, setDateQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(0);

  useEffect(() => {
    const filePath = "/extra/WhatsApp Chat with Sudarshan.txt";
    const startTime = Date.now();

    const cachedChat = localStorage.getItem("chatData");
    if (cachedChat) {
      setMessages(JSON.parse(cachedChat));
      return;
    }

    fetch(filePath)
      .then((response) => response.text())
      .then((text) => {
        const lines = text.split("\n");
        let chatData = [];

        const calculateRemainingTime = (index) => {
          const elapsedTime = (Date.now() - startTime) / 1000;
          const estimatedTime = (elapsedTime / (index + 1)) * lines.length;
          const remainingTime = estimatedTime - elapsedTime;
          return Math.max(0, Math.round(remainingTime / 60));
        };

        lines.forEach((line, index) => {
          setTimeout(() => {
            const currentProgress = ((index / lines.length) * 100).toFixed(2);
            setProgress(currentProgress);
            console.log("Progress:", currentProgress + "%");

            const remainingTime = calculateRemainingTime(index);
            setLoadingTime(`${remainingTime} minute(s) remaining`);

            const messageElement = {};
            let senderName = '';
            let isSharanya = false;

            let dateMatch = line.match(/^(\d{2})\/(\d{2})\/(\d{2})/);
            let messageDate = dateMatch ? `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}` : "";

            if (line.includes("Sudarshan")) {
              senderName = 'Sudarshan';
              isSharanya = false;
            } else if (line.includes("Sharanya")) {
              senderName = 'Sharanya';
              isSharanya = true;
            }

            if (line.includes("(file attached)")) {
              const fileName = line.match(/(IMG-|VID-|PTT-|STK-).*?\.(jpg|png|webp|mp4|opus|gif|pdf)/i);
              if (fileName) {
                const filePath = fileName[0];
                const fileExt = filePath.split(".").pop().toLowerCase();

                if (["jpg", "png", "webp", "gif"].includes(fileExt)) {
                  messageElement.type = "file";
                  messageElement.content = (
                    <div data-date={messageDate}>
                      <span className="sender-name">{senderName}</span>
                      <img src={`/extra/media/${filePath}`} className="media" alt="Media" />
                    </div>
                  );
                } else if (["mp4"].includes(fileExt)) {
                  messageElement.type = "file";
                  messageElement.content = (
                    <div data-date={messageDate}>
                      <span className="sender-name">{senderName}</span>
                      <video className="media" controls>
                        <source src={`/extra/media/${filePath}`} type="video/mp4" />
                      </video>
                    </div>
                  );
                } else if (["opus"].includes(fileExt)) {
                  messageElement.type = "file";
                  messageElement.content = (
                    <div data-date={messageDate}>
                      <span className="sender-name">{senderName}</span>
                      <audio className="media" controls>
                        <source src={`/extra/media/${filePath}`} type="audio/ogg" />
                      </audio>
                    </div>
                  );
                } else if (["pdf"].includes(fileExt)) {
                  messageElement.type = "file";
                  messageElement.content = (
                    <div data-date={messageDate}>
                      <span className="sender-name">{senderName}</span>
                      <a href={`/extra/media/${filePath}`} target="_blank" rel="noopener noreferrer" className="file">
                        📄 View PDF
                      </a>
                    </div>
                  );
                }
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

            if (index === lines.length - 1) {
              localStorage.setItem("chatData", JSON.stringify(chatData));
            }
          }, index * 20);
        });
      })
      .catch((error) => console.error("Error loading chat:", error));
  }, []);

  // **Date Search Functions**
  const formatDateInput = (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 6) value = value.slice(0, 6);
    let formattedValue = value.replace(/(\d{2})(\d{0,2})(\d{0,2})/, (match, p1, p2, p3) => {
      return [p1, p2, p3].filter(Boolean).join("/");
    });
    setDateQuery(formattedValue);
  };

  const handleDateSearch = () => {
    if (!dateQuery) return;

    const messageElements = document.querySelectorAll(".message div[data-date]");
    let foundMessages = [];

    messageElements.forEach((msg) => {
      if (msg.getAttribute("data-date") === dateQuery) {
        foundMessages.push(msg);
      }
    });

    if (foundMessages.length > 0) {
      setSearchResults(foundMessages);
      setSearchIndex(0);
      foundMessages[0].scrollIntoView({ behavior: "smooth", block: "start" });
      foundMessages[0].classList.add("highlighted");
      setTimeout(() => foundMessages[0].classList.remove("highlighted"), 3000);
    } else {
      alert("No messages found for this date.");
    }
  };

  const handleNextSearch = () => {
    if (searchResults.length === 0) return;
  
    // Remove highlight from previous search
    searchResults[searchIndex].classList.remove("highlighted");
  
    // Increment index and loop back if needed
    let newIndex = (searchIndex + 1) % searchResults.length;
    
    // Scroll to the new search result
    searchResults[newIndex].scrollIntoView({ behavior: "smooth", block: "center" });
  
    // Highlight the new message
    searchResults[newIndex].classList.add("highlighted");
  
    // Remove highlight after a delay
    setTimeout(() => searchResults[newIndex].classList.remove("highlighted"), 2500);
  
    // Update the search index
    setSearchIndex(newIndex);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (searchResults.length === 0) {
        handleDateSearch();
      } else {
        handleNextSearch();
      }
    }
  };

  const handlePrevSearch = () => {
    if (searchResults.length === 0) return;

    searchResults[searchIndex].classList.remove("highlighted");

    let newIndex = (searchIndex - 1 + searchResults.length) % searchResults.length;
    searchResults[newIndex].scrollIntoView({ behavior: "smooth", block: "center" });

    searchResults[newIndex].classList.add("highlighted");
    setTimeout(() => searchResults[newIndex].classList.remove("highlighted"), 2500);

    setSearchIndex(newIndex);
  };

  return (
    <div className="chat-viewer">
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progress-text">
        <span>{loadingTime}</span>
        <span className="progress-percentage">{progress}%</span>
      </div>

      {/* **Date Search** */}
      <div className="date-search">
        <input type="text" placeholder="Enter date (DD/MM/YY)" value={dateQuery} onChange={formatDateInput} onKeyPress={handleKeyPress} className="date-input" />
        <button onClick={handleDateSearch}>Go</button>
        <button onClick={handlePrevSearch} className="prev-button">Prev</button>
        <button onClick={handleNextSearch}>Next</button>
          
      </div>

      <div className="chat-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isSharanya ? "sent" : "received"}`} data-date={message.date}>
            {message.messageElement.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatViewer;
