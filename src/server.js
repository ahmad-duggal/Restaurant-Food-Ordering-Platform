const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is flying on port ${PORT}`);
});

// {
//     {
//     "success": true,
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5Nzk2NzgxYWI4NmRlYTk0MmM5NGI3MyIsImlhdCI6MTc2OTU2NDAzMywiZXhwIjoxNzcyMTU2MDMzfQ.P9cWkY65YC9Y2XG-NDNVGiTxbmoJYS5Wabta4CL8BJw",
//     "data": {
//         "id": "69796781ab86dea942c94b73",
//         "name": "Ahmad",
//         "email": "ahmad@example.com"
//     }
// }
