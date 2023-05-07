const fs = require('fs');
const path = require('path');

const { stdin, stdout } = process;
const output = fs.createWriteStream(path.join(__dirname, 'text.txt'));
console.log('Привет! Что записать? [Для выхода введите "exit" или нажмите CTRL + C]');

stdin.on('data', data => {
  if (data.toString().trim() === 'exit') {
    process.exit();
  } else if (!data.toString().replace(/\r\n/g, '').length) {
    console.log('Вы ничего не ввели. Пожалуйста, введите текст [Для выхода введите "exit" или нажмите CTRL + C]');
  } else {
    output.write(data);
    console.log('Добавите что-нибудь? [Для выхода введите "exit" или нажмите CTRL + C]');
  }
});

process.on('exit', () => {
  stdout.write('Увидимся!');
});

process.on('SIGINT', () => {
  process.exit();
});
