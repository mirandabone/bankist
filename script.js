'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-05-04T23:36:17.929Z',
    '2022-05-06T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayCurrency = function (
  num,
  locale = currentAccount.locale,
  currency = currentAccount.currency
) {
  const options = {
    style: 'currency',
    currency: currency,
  };
  const roundedToCents = num.toFixed(2);
  return new Intl.NumberFormat(locale, options).format(roundedToCents);
};

const formatMovementDate = function (date) {
  const calcDaysPassed = function (date1) {
    const days = Math.round((new Date() - date1) / (1000 * 60 * 60 * 24));
    return days;
  };
  if (calcDaysPassed(date) === 0) return 'Today';
  else if (calcDaysPassed(date) === 1) return 'Yesterday';
  else if (calcDaysPassed(date) <= 7) return `${calcDaysPassed(date)} days ago`;
  else {
    return new Intl.DateTimeFormat(currentAccount.locale).format(date);
  }
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${formatMovementDate(date)}</div>
        <div class="movements__value">${displayCurrency(mov)}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${displayCurrency(acc.balance)}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${displayCurrency(incomes)}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${displayCurrency(Math.abs(out))}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${displayCurrency(interest)}`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const logoutInterval = 30000; //5 * 60 * 1000; //5 minutes, in milliseconds
let timer;

const startLogoutTimer = function (logoutInterval) {
  let timeToLogout = logoutInterval;

  //display and increment logout timer
  const tick = function () {
    //display timer
    const options = {
      minute: 'numeric',
      second: 'numeric',
    };
    labelTimer.textContent = new Intl.DateTimeFormat('en-AU', options).format(
      timeToLogout
    );

    //actually log people out if it expires
    if (timeToLogout <= 0) {
      // Hide UI
      labelWelcome.textContent = 'Login to Continue';
      containerApp.style.opacity = 0;
      //set currentAccount to null
      currentAccount = '';
    }

    timeToLogout -= 1000;
  };
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);

  //restart Logout timer
  if (timer) clearInterval(timer);
  timer = startLogoutTimer(logoutInterval);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

// //Fake Logged In (TODO comment this out when Dev phase is finished)
// currentAccount = account1;
// containerApp.style.opacity = 100;
// updateUI(currentAccount);
// labelWelcome.textContent = `I see you, Developer`;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Create current date and time - manually
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}  ${hour}:${min}`;

    //Creating current Date and Time with International API
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    const locale = currentAccount.locale; // to set it to the locale of the browser, use :   locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //add transfer Date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);
      //add loan Date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
//LESSON Timeout functions
//setTimeout
const ingredients = [`olives`, `spinach`];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`here is your pizza with ${ing1} and ${ing2}!`),
  3000,
  ...ingredients
);
console.log(`waiting`);
//the timeout function does NOT pause code execution while waitimg for time to elapse
// we can cancel the timer programaticly until it elapses
if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//setInteval
setInterval(function () {
  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };
  console.log(new Intl.DateTimeFormat('en-AU', options).format(now));
}, 1000);
//go on, make a real clock this way  - well, kinda did it
*/
/*
//LESSON Internationalisation
//most of these lectures were practical, and in Bankist
const num = 3884764.23;
const options = {
  style: 'currency',
  currency: 'EUR',
};
const options2 = {
  style: 'unit',
  unit: 'mile-per-hour',
};
console.log('US:  ', new Intl.NumberFormat('en-US', options).format(num));
console.log('Oz:  ', new Intl.NumberFormat('en-AU', options).format(num));

console.log('Germany:  ', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria:  ', new Intl.NumberFormat('ar-SY', options).format(num));
*/
/*
//LESSON Operations with Dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(Number(future)); //gives timestamp in milliseconds

//give days between two dates
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(days1);

//If you want to cover edge cases like daylight savings etc, use a date library like Moment
*/
/*
//LESSON Dates and Times Fundamentals
//create a date
//using Date constructor
const now = new Date();
console.log(now);
console.log(new Date('May 5 2022 15:40')); //copy a date string from somewhere
console.log(new Date('Dec 24 2015')); //make up a date string
console.log(new Date(account1.movementsDates[0])); //grab a date JS wrote
console.log(new Date(2037, 10, 19, 15, 23, 5));
//YYYY, MM (zero based), DD, HH, MM, SS
console.log(new Date(0)); // begining of Unix time
console.log(new Date(3 * 24 * 60 * 60 * 1000)); //3 days of milliseconds since begining of Unix time
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(`Date methods ${future}`);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate()); //day of the month
console.log(future.getDay()); //Of the week, with sunday being 0
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()); //this is how the dates in the movement arrays were made
console.log(future.getTime()); //number of milliseconds since Jan 1st 1970

console.log(new Date(2142217385000)); //returns date with this no of milliseconds since Jan 1 1970
console.log(Date.now()); //timestamp of now

//We can also set the year, month, date, etc. It will autocorrect the day of the week
future.setFullYear(2040);
console.log(future);
//we are not typing them all out :)
*/
/*
//LESSON BigInt
//A normal floating point number has only 64 bits. These are not all for storing the number though
//Only 53 bits store the number, the others store the position of the decimal place, adn the sign
//This is the biggest a JS integer can be:
console.log(2 ** 53 - 1);

//if we try and make it bigger, it gets dodgy - they are unsafe numbers and are sometimes handled ok, but often not
console.log(2 ** 53 + 9);

console.log(12497613486513847230958293874139876419384n);
console.log(BigInt(12497613486513847230958293874139876419384)); //note here JS seems to have to store the long number in an unsafe way prior to making it a bigInt. Only use BigInt to make safe numebrs that are going to grow to unsafe sizes

//we can do operations on BigInt just like regular numbers BUT can't mix BigINT with regular numbers
const huge = 823508237569834769347520784623087n;
const num = 23;
// console.log(huge * num); //Nup!
console.log(huge * BigInt(num)); //that's how you do it

//exceptions
console.log(20n > 15); //compares the two and returns true
console.log(20n === 20); //well they are not strictly equall, they are differnet primitive types
console.log(typeof 20n); //tells you BigInt
console.log(20n == '20'); //because here we are not being strict about types
console.log(huge + ' is really big'); //the bigInt does get converted to a string

//Math.sqrt(huge);  //Math functions try to automatically convert things to a number, and they just can't do that to BigInt so they fail

//division
console.log(10n / 3n);  //hehe notice it can't do fractions/decimals. it just returns the closest bigInt it can
console.log(10 / 3);
*/
/*
//LESSON Numeric Separators
const diameter = 287460000000; // hard to read!!
//bring on the separators! underscores we can put anywhere
const diameterBetter = 287_460_000_000; // much easier!
console.log(diameter, diameterBetter); //JS sees them the same

//Can also use to show cents
const price = 345_99;
console.log(price);

//Must put underscore between two digits of a number. Not next to a decimal place or the begining or end of a number
//Only use underscore when hardcoding numbers. If you need to store a number in a string, and it has a number in it, you will get 
*/
/*
//LESSON Remainder Operator %
console.log(5 % 2); //returns 1, becasue 5= 2*2 +1
console.log(8 % 3); //returns 2, because 8 = 3*2 +2
//Useful to check if number is even or odd
// const isEven = function (num) {
//   if (num % 2 === 0) return true;
//   else return false;
// };  //But better to use arrow function here
const isEven = n => n % 2 === 0;
console.log(isEven(9));
//lets use this to colour the movement rows in a systematic way
labelBalance.addEventListener('click', function (e) {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    //colour every second row
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    //and every 3rd also
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
*/
/*
//LESSON Numbers

//in JS all numbers are represented interanlly as floating point numbers. eg the following is true
console.log(23 === 23.0);

//but these are represented in binary, not base 10, which gives some strange results when working with fractions/decimals
console.log(0.1 + 0.2);
//notice all the tailing 0s and the 4 at the end? JS actually rounds sometimes to hide these issues, but it is just not suitable for precise calculations

//YOu can convert strings to numbers by using the Number('23') function, or by putting a + in front eg +(23)
// Jonas Schmedmann prefers using the +
// there are a lot of functions in the Number namespace, which should be accessed by calling them on the Number object, here it is with parseFloat:

//extracting numbers from strings
console.log(Number.parseFloat('  2.5rem ')); // we can extact the first floating point number from a string, providing there are no other symbols preceeeding it (whitespace is ok)
console.log(Number.parseInt('  2.5rem ')); //parseInt is similar but it only extracts the integer

//checking value is NaN (literally this special value of NaN)
console.log(Number.isNaN(20)); // a number, not a NaN
console.log(Number.isNaN('20')); //a string, not a NaN
console.log(Number.isNaN(+'20Xyz')); //only comes out as NaN if we try to convert to Number and fail (with the + sign). Otherwise it is simply a string, not a NaN
console.log(Number.isNaN(20 / 0)); // divinding by 0 gives infinity, which is not a NaN
//So .isNaN isn't that good at deciding what is a number and what isn't.  But there is a BETTER WAY!!

//checking if value is a member of set of finite numbers  ****BEST OPTION**** for checking if it is a number
console.log(Number.isFinite(20 / 0)); //gives false because the expression evaluates to infinity
console.log(Number.isFinite(20)); //true
console.log(Number.isFinite('20')); //gives false because it is a string, not a member of set of finite numbers

//checking if value is a member of set of integer numbers
console.log(Number.isInteger(20)); //true
console.log(Number.isInteger(20.4567)); //false, as it has decimal places
console.log(Number.isInteger('20')); //false, as it is a string
*/
/*
//LESSON Math operations
//there are a bunch of useful operations in the Math namespace.

//square roots and higher order roots
console.log(Math.sqrt(25)); //gives 5, square root of 25
console.log(25 ** (1 / 2)); //ALSO gives 5, because that's how fractional exponents work in maths
console.log(25 ** (1 / 3)); //So it's an easy way to get the cube root

//Max and Min
console.log(Math.max(5, 18, 23, 11, 2)); //returns max of a group of numbers
console.log(Math.max(5, 18, '23', 11, 2)); //does type coercion on the group of numbers
console.log(Math.max(5, 18, '23XX', 11, 2)); //does NOT parseInt or parseFloat on the numbers  - Gives NaN if uncoercable strings are included in group
console.log(Math.min(5, 18, 23, 11, 2)); //same as .max, but returns the minimum

//constants are available too
console.log(Math.PI); //3.14etc
console.log(Math.PI * Number.parseFloat('10px') ** 2); // Pi r squared, area of a 10 pixel radius circle
console.log(Math.trunc(Math.random() * 6) + 1); //random values between 1 and 6
const randomInt = (min, max) => {
  const random = Math.floor(Math.random() * (max + 1 - min)) + min;
  return random;
};
///SIDE NOTE   --- WOW HOW AWESOME ARE TESTS!!!!!!!!!! And also array methos to make the tests
const testArray0t1 = Array(100)
  .fill(1)
  .map(_ => randomInt(0, 1))
  .sort((a, b) => a - b);
console.log(testArray0t1);

const testArray1t6 = Array(100)
  .fill(1)
  .map(_ => randomInt(1, 6))
  .sort((a, b) => a - b);
console.log(testArray1t6);

const testArray50t100 = Array(100)
  .fill(1)
  .map(_ => randomInt(50, 100))
  .sort((a, b) => a - b);
console.log(testArray50t100);
//Rounding Intergers
console.log(Math.trunc(23.33333)); //just removes the decimals

console.log(Math.round(23.333)); //rounds according to if it is closer to the upper or lower integer
console.log(Math.round(23.888));

console.log(Math.ceil(23.333)); ///rounds up, always
console.log(Math.ceil(23.888));

console.log(Math.floor(23.333)); // rounds down, always (similar to trunc for positive numbers - BUT NOT for negative ones)
console.log(Math.floor(23.888));

//Rounding Decimals
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(4));
console.log((2.7458).toFixed(2));
console.log((-2.7458).toFixed(2));
console.log(+(2.7458).toFixed(2));
*/
