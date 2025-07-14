import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {PokemonListPage} from "./PokemonListPage";
import {PokemonDetailPage} from "./PokemonDetailPage";
import { FavoritesList } from "./FavoriteListPage";

//App just gives the routes for the different pages
function App() {  

  //pages passed as props
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PokemonListPage />} /> 
        <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
        <Route path="/favorites" element={<FavoritesList />} />
      </Routes>
    </Router>
  );
}

export default App;