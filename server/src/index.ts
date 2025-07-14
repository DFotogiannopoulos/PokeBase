import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import fs from "fs";


dotenv.config(); //use enviroment variable
const PORT = process.env.PORT || 8000;

const app = express(); 

app.use(express.json()); //json to post favorites
app.use(cors()); //so express accepts requests from React App

const favPath = path.join(__dirname,'favorites.json'); //build path

if (!fs.existsSync(favPath)) {
  fs.writeFileSync(favPath, JSON.stringify([]));
}

//handle add favorite
app.post('/add-favorite',(req,res) => {
  const {id, name, frontSprite} = req.body;

  if(!id || !name || !frontSprite){
    res.status(400).send("Something is missing!");
  }

  const favorites = JSON.parse(fs.readFileSync(favPath, 'utf-8')); //favorites list

  favorites.push({ id, name, frontSprite });
  fs.writeFileSync(favPath, JSON.stringify(favorites, null, 2)); //write with readable format
  res.send({message:'Your wish is my command'});

  }
)

//handle show list with favorites
app.get('/favorites',(req,res) =>{
  try {
    const favorites = JSON.parse(fs.readFileSync(favPath, 'utf-8'));
    res.json(favorites);
  } catch (error) {
    res.send({message:"Error"});
  }
} )

//handle delete from favorites
app.delete('/favorites/:id', (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const favorites = JSON.parse(fs.readFileSync(favPath, 'utf-8')); //read file
    const newFavorites = favorites.filter((pokemon: { id: number }) => pokemon.id !== id); //filter favorites, return only the ones without the given id

    fs.writeFileSync(favPath, JSON.stringify(newFavorites, null, 2));
    res.json({ message: 'Favorite removed successfully' });
  } catch (error) {
    res.send({message:"Could not delete the Pokemon"});
  }
});

app.listen(PORT, () => {
  console.log(`Pokedex app listening on port ${PORT}`);
})
