import express from 'express' ;
import cartRouter from './route/cartroute.js'


const app = express() ;
app.use(express.json());
const PORT = 4000 ;

app.listen(PORT,() => console.log(`Server started at PORT:${PORT}`));

app.use("/cart",cartRouter);