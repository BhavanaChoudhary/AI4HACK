document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.querySelector('.chatbot-toggle');
    const chatBox = document.getElementById('chat-box');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('chat-messages');
    const closeBtn = document.getElementById('chat-close');
    const attachBtn = document.getElementById('attach-btn');
    const fileInput = document.getElementById('file-input');
    const quickBtns = document.querySelectorAll('.quick-btn');
    const notificationBadge = document.querySelector('.notification-badge');

    let isChatOpen = false;
    let unreadMessages = 0;

    // Toggle chat visibility
    toggleBtn.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatBox.classList.add('visible');
            chatBox.classList.remove('hidden');
            unreadMessages = 0;
            updateNotificationBadge();
        } else {
            chatBox.classList.remove('visible');
            chatBox.classList.add('hidden');
        }
    });

    // Close chat
    closeBtn.addEventListener('click', () => {
        chatBox.classList.remove('visible');
        isChatOpen = false;
    });

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Quick question buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            sendMessage();
        });
    });

    // File attachment
    attachBtn.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileUpload);

    // Handle sending messages
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        userInput.value = '';
        
        // Show typing indicator
        showTypingIndicator();
        
        try {
            const response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            removeTypingIndicator();
            addMessage(data.reply, 'ai');
            
            // Scroll to bottom
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        } catch (error) {
            removeTypingIndicator();
            addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'ai');
            console.error('Error:', error);
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(`${sender}-msg`);
        messageDiv.textContent = text;
        messagesDiv.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
        
        // Update notification badge if chat is closed
        if (sender === 'ai' && !isChatOpen) {
            unreadMessages++;
            updateNotificationBadge();
        }
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('typing-indicator');
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('typing-dot');
            typingDiv.appendChild(dot);
        }
        
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Handle file upload
    function handleFileUpload() {
        const file = fileInput.files[0];
        if (!file) return;
        
        // Check file size (limit to 5MB)
        if (file.size > 5 * 1024 * 1024) {
            addMessage("File is too large. Please upload files smaller than 5MB.", 'ai');
            return;
        }
        
        // Display file info
        addMessage(`Attachment: ${file.name} (${formatFileSize(file.size)})`, 'user');
        
        // Here you would typically upload the file to your server
        // For demonstration, we'll just show a message
        addMessage("I've received your file. I'll analyze it and get back to you shortly.", 'ai');
        
        // Reset file input
        fileInput.value = '';
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }

    // Update notification badge
    function updateNotificationBadge() {
        if (unreadMessages > 0) {
            notificationBadge.classList.remove('hidden');
            notificationBadge.textContent = unreadMessages > 9 ? '9+' : unreadMessages;
        } else {
            notificationBadge.classList.add('hidden');
        }
    }

    // Auto-focus input when chat opens
    chatBox.addEventListener('transitionend', () => {
        if (chatBox.classList.contains('visible')) {
            userInput.focus();
        }
    });
});