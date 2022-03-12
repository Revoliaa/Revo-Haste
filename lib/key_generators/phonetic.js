const randOf = (collection) => {
  return () => {
    return collection[Math.floor(Math.random() * collection.length)];
  };
};

const randVowel = randOf('aeiou');
const randConsonant = randOf('bcdfghjklmnpqrstvwxyz');

module.exports = class PhoneticKeyGenerator {
  createKey(keyLength) {
    let text = '';
    const start = Math.round(Math.random());

    for (let i = 0; i < keyLength; i++) {
      text += (i % 2 == start) ? randConsonant() : randVowel();
    }

    return text;
  }
};
