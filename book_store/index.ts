const puppeteer = require('puppeteer');
const fs = require('fs');
import { Browser } from 'puppeteer';

type Book = {
  title: string;
  price: number;
  imgSrc: string;
  rating: number;
};

const url = 'https://books.toscrape.com/';

async function main() {
  const browser: Browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const bookData = await page.evaluate((url) => {
    const convertPrice = (price: string) => {
      return parseFloat(price.replace('£', ''));
    };

    const ratingMap: { [key: string]: number } = {
      One: 1,
      Two: 2,
      Three: 3,
      Four: 4,
      Five: 5,
    };

    const ratingToNumber = (rating: string) => {
      return ratingMap[rating] || 0;
    };

    const data: Book[] = [];

    const bookPods = Array.from(document.querySelectorAll('.product_pod'));
    bookPods.forEach((book: any) => {
      data.push({
        title: book.querySelector('h3 a').getAttribute('title'),
        price: convertPrice(book.querySelector('.price_color').innerText),
        imgSrc: url + book.querySelector('img').getAttribute('src'),
        rating: ratingToNumber(book.querySelector('.star-rating').classList[1]),
      });
    });

    return data;
  }, url);

  await browser.close();

  fs.writeFile('data.json', JSON.stringify(bookData), (err: any) => {
    if (err) throw err;
    console.log('Successfuly saved book data');
  });
}

main();
