import express from "express";
import axios from "axios";
const router = express.Router();

const WINDOW_SIZE = 10;
let numberWindow = [];

const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNDc1MTMzLCJpYXQiOjE3NDI0NzQ4MzMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjViMmRlYWYxLTNmNDYtNGVhYS1hZDAzLWY3NDNmNDNkMzRkNyIsInN1YiI6InJhamFzZWtoYXJfYkBzcm1hcC5lZHUuaW4ifSwiY29tcGFueU5hbWUiOiJBRkZPUkQgTUVESUNBTCBURUNITk9MT0dJRVMgUFZULiBMVEQiLCJjbGllbnRJRCI6IjViMmRlYWYxLTNmNDYtNGVhYS1hZDAzLWY3NDNmNDNkMzRkNyIsImNsaWVudFNlY3JldCI6IndreExoUEp3Tm9DZFFmaWEiLCJvd25lck5hbWUiOiJSYWphIFNla2hhciIsIm93bmVyRW1haWwiOiJyYWphc2VraGFyX2JAc3JtYXAuZWR1LmluIiwicm9sbE5vIjoiQVAyMjExMDAxMTY0OCJ9.hrZzGzHIVMuLaCewhZogCDJBH-0DrvkdcpNj8F95ZMg";
const API_URLS = {
  p: "http://20.244.56.144/test/primes",
  f: "http://20.244.56.144/test/fibo",
  e: "http://20.244.56.144/test/even",
  r: "http://20.244.56.144/test/rand",
};

async function fetchNumbers(type) {
  try {
    const response = await axios.get(API_URLS[type], {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    });
    console.log(response);
    return response.data.numbers || [];
  } catch (error) {
    console.log("error", error.message);
    return [];
  }
}

function updateWindow(newNumbers) {
  newNumbers.forEach((num) => {
    if (!numberWindow.includes(num)) {
      if (numberWindow.length >= WINDOW_SIZE) {
        numberWindow.shift();
      }
      numberWindow.push(num);
    }
  });
}

function calculateAverage() {
  if (numberWindow.length === 0) return 0;
  return (
    numberWindow.reduce((sum, num) => sum + num, 0) / numberWindow.length
  ).toFixed(2);
}

router.get("/numbers/:numberid", async (req, res) => {
  const { numberid } = req.params;
  if (!API_URLS[numberid]) {
    return res.status(400).json({ error: "Invalid number type" });
  }
  console.log("hello");
  const prevState = [...numberWindow];
  const newNumbers = await fetchNumbers(numberid);
  updateWindow(newNumbers);

  res.json({
    windowPrevState: prevState,
    windowCurrState: numberWindow,
    numbers: newNumbers,
    avg: parseFloat(calculateAverage()),
  });
});

export default router;
