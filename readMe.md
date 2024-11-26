# Hướng Dẫn Cơ Bản

## Cấu trúc lệnh

```javascript
module.exports = {
    name: "Tên lệnh",
    info: "Mô tả lệnh",
    dev: "Tác giả",
    onPrefix: true, // hoặc false
    dmUser: false, // true hoặc false
    nickName: ["bí danh1", "bí danh2"], // mảng bí danh
    usages: "Hướng dẫn sử dụng",
    cooldowns: 10, // thời gian hồi (cooldown) tính bằng giây
    onLaunch: async function ({ api, event, actions }) {
        // Logic lệnh ở đây
    }
};
```

### onLaunch
Hàm `onLaunch` được thực thi khi lệnh được gọi. Nó có thể xử lý các nhiệm vụ khởi tạo và phản hồi sự kiện.

**Ví dụ:**
```javascript
onLaunch: async function ({ api, event, actions }) {
    const message = "Lệnh đã được thực thi!";
    await actions.reply(message);
}
```

### onEvents với đối số target
Hàm `onEvents với Target` được kích hoạt với các đối số, bao gồm cả mục tiêu.

**Ví dụ:**
```javascript
onEvents: async function ({ api, event, target }) {
    const targetText = target.join(" ");
    if (!targetText) return actions.reply("Cung cấp văn bản");
    // Logic hàm ở đây 
}
```

### onReply
Hàm `onReply` được thực thi khi người dùng phản hồi một tin nhắn cụ thể. Điều này cho phép phản hồi theo ngữ cảnh.

**Ví dụ:**
```javascript
onReply: async function ({ reply, api, event }) {
    const response = `Bạn đã nói: ${reply}`;
    await actions.reply(response);
}
```

### callReact
Hàm `callReact` được gọi khi người dùng phản ứng với một tin nhắn. Nó cho phép thực hiện các hành động xác nhận hoặc xử lý các phản ứng.

**Ví dụ:**
```javascript
callReact: async function ({ reaction, event, api }) {
    if (reaction === '👍') {
        await actions.reply("Đã xác nhận!");
    } else if (reaction === '👎') {
        await actions.reply("Đã hủy bỏ.");
    }
}
```

### noPrefix
Hàm `noPrefix` cho phép lệnh được thực thi mà không cần tiền tố, hữu ích cho các tương tác tự nhiên hơn.

**Ví dụ:**
```javascript
noPrefix: async function ({ api, event }) {
    await actions.reply("Lệnh này có thể được thực thi mà không cần tiền tố.");
}
```

## Hành động

Đối tượng `actions` cung cấp các phương thức để phản hồi các tương tác của người dùng.

### Phản hồi tin nhắn
Phản hồi trực tiếp cho người dùng.
```javascript
actions.reply("Xin chào!");
```

### Gửi tin nhắn
Gửi một tin nhắn đến cuộc trò chuyện.
```javascript
actions.send("Xin chào, mọi người!");
```

### Phản ứng với tin nhắn
Phản ứng với tin nhắn hiện tại bằng một emoji.
```javascript
actions.react("🔥");
```

### Chỉnh sửa tin nhắn
Chỉnh sửa một tin nhắn đã được gửi trước đó.
```javascript
const loading = await actions.reply("Đang tải...");
actions.edit("Xin chào", loading.messageID);
```

### Đá người dùng
Xóa một người dùng khỏi nhóm.
```javascript
actions.kick(userID);
```

### Rời khỏi nhóm
Xóa bot khỏi nhóm hiện tại.
```javascript
actions.leave();
```

### Chia sẻ liên hệ
Chia sẻ một liên hệ với một người dùng cụ thể.
```javascript
actions.share(contact, senderID);
```

## Sử dụng bí danh và dmUser

### Bí danh
Bạn có thể sử dụng các bí danh cho các lệnh bằng cách định nghĩa thuộc tính `nickName` trong đối tượng lệnh của bạn. Điều này cho phép nhiều tên cho cùng một lệnh.

**Ví dụ:**
```javascript
module.exports = {
    name: "test",
    nickName: ["test", "testing"],
    onLaunch: async function ({ api, event, actions }) {
        await actions.reply("Đây là một lệnh kiểm tra.");
    },
    // các thuộc tính khác...
};
```

### dmUser
Thuộc tính `dmUser` cho biết liệu một lệnh có thể được thực hiện thông qua tin nhắn trực tiếp hay không. Nếu `dmUser` là `true`, lệnh có thể được sử dụng trong tin nhắn trực tiếp.

**Ví dụ:**
```javascript
module.exports = {
    name: "example",
    dmUser: true,
    onLaunch: async function ({ api, event, actions }) {
        await actions.reply("Lệnh này có thể được thực hiện trong tin nhắn trực tiếp.");
    },
    // các thuộc tính khác...
};
```

## Tùy chọn toàn cục

```javascript
 global.cc.prefix
 global.cc.botName
 global.cc.ownerName
 global.cc.adminUIDs
 global.cc.moderatorUIDs
 global.cc.proxy
 // vv. global.cc // bắt đầu cấu hình của bạn
```

## Phông chữ

```javascript
 //ví dụ
 const bold = global.fonts.bold("xin chào")
 actions.reply(bold)
```


### Tóm tắt

Tài liệu này cung cấp cái nhìn tổng quan về cách triển khai và sử dụng các lệnh trong bot của bạn. Nó nhấn mạnh các phương thức xử lý sự kiện và chức năng hành động để phản hồi các tương tác của người dùng. Đảm bảo làm theo cấu trúc và các ví dụ để tích hợp các lệnh mới một cách hiệu quả.


Cảm ơn và dành tặng Kaguya Teams, Cc Projects và Cộng đồng Chatbot.

Tài liệu này cung cấp tổng quan về cách triển khai và sử dụng các lệnh trong bot của bạn. Nó làm nổi bật các phương pháp xử lý sự kiện và chức năng hành động để đáp ứng các tương tác của người dùng. Đảm bảo tuân theo cấu trúc và ví dụ để tích hợp các lệnh mới một cách hiệu quả.
