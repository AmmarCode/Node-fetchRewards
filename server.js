import express from "express";
import bodyParser from "body-parser";

// initializing app by invoking express
const app = express();
// use body parser to convert data to json format
app.use(bodyParser.json());

// Mock data
const mockTransactions = [
  { payer: "DANNON", points: 1000, timestamp: "2020-11-02T14:00:00Z" },
  { payer: "UNILEVER", points: 200, timestamp: "2020-10-31T11:00:00Z" },
  { payer: "DANNON", points: -200, timestamp: "2020-10-31T15:00:00Z" },
  { payer: "MILLER COORS", points: 10000, timestamp: "2020-11-01T14:00:00Z" },
  { payer: "DANNON", points: 300, timestamp: "2020-10-31T10:00:00Z" },
];

// -------------------------Transactions-------------------------
// POST - Add Transaction    Callback function
app.post("/addtransaction", (req, res) => {
  const transaction = req.body;

  for (let key of Object.keys(transaction)) {
    if (!transaction[key])
      return res.status(400).json("Required form data not filled");
  }
  // Add transaction to mock data
  mockTransactions.push(transaction);

  res.send(transaction);
});
// -------------------------Points------------------------------
// POST - Spend Points
app.post("/spendpoints", (req, res) => {
  let { spentPoints } = req.body;

  // Check if the amount of points to spend is more than user's points balance
  let totalAvailablePoints = 0
  mockTransactions.forEach(transaction => {
    totalAvailablePoints += transaction.points
  })
  if(spentPoints > totalAvailablePoints) {
    return res.status(400).json("Required points is more than user's balance")
  }

  // Sort the mock data order by timestamp
  mockTransactions.sort(function (a, b) {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  // set an obj to store payer's spent points
  let spentPointsReport = {};
  let i = 0;
  // Loop through sorted data, save the amount of spent points and updated balances
  while (spentPoints > 0 && i < mockTransactions.length) {
    let currentPayer = mockTransactions[i].payer;
    let pointsSpentByPayer = Math.min(mockTransactions[i].points, spentPoints);

    if (!(currentPayer in spentPointsReport)) {
      spentPointsReport[currentPayer] = pointsSpentByPayer;
      mockTransactions[i]["points"] -= pointsSpentByPayer;
    } else {
      spentPointsReport[currentPayer] += pointsSpentByPayer;
      mockTransactions[i]["points"] -= pointsSpentByPayer;
    }
    spentPoints -= pointsSpentByPayer;
    i++;
  }
  // loop through spent points obj and adjust value to negative
  for (let [key, value] of Object.entries(spentPointsReport)) {
    spentPointsReport[key] = -1 * value;
  }

  res.send(spentPointsReport);
});

// -------------------------Balances---------------------------
//  GET payer balances
app.get("/getpayerbalances", (req, res) => {
  // get total balances available for each payer
  let payerBalances = mockTransactions.reduce((acc, i) => {
    if (acc.hasOwnProperty(i.payer)) {
      acc[i.payer] += i.points;
    } else {
      acc[i.payer] = i.points;
    }
    return acc;
  }, {});
  res.send(payerBalances);
});

app.listen(3000, () => {});
