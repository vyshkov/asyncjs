function generateRandomName() {
    const firstNames = ['Володимир', 'Іван', 'Андрій', 'Сергій', 'Віталій', 'Валерій', 'Емануель', 'Григорій'];
    const lastNames = ['Столичний', 'Штучний', 'Задорожний', 'Перекидайло', 'Беконенко', 'Кінь', 'Непийко', 'Кукурудза', 'Огого', 'Стетхем', 'Оригінальний', 'Черезтинногуперекидайло', 'Докторович', 'Нестримний', 'Котярченко', 'Медоїд', 'Шварцнегер', 'Річардович'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
}

module.exports = generateRandomName;