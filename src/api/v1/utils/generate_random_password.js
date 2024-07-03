async function generateRandomPassword() {
    const passwordLength = 8; // độ dài mật khẩu
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&"; // các ký tự có thể có trong mật khẩu
    let password = "";
  
    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * possibleChars.length);
      password += possibleChars[randomIndex];
    }
  
    return password;
}

module.exports = { generateRandomPassword }