import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { Navigate } from "react-router-dom";


//helps changing clearly the state of the list when new favorite is added
type Pokemon = {
  id: number;
  name: string;
  frontSprite: string;
  backSprite: string;
};

export function FavoritesList() {
  const [favorites, setFavorites] = useState<Pokemon[]>([]); //beginning from empty list set favorites based on the json
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchPokemon, setSearchPokemon] = useState('');
  const navigate = useNavigate();

  useEffect(() => { //run on [searchPokemon,navigate] change
    if (!searchPokemon) return; //nothing searched return

    const delay = setTimeout(() => { //start timer,if 1 sec passes navigate to the route
      navigate(`/pokemon/${searchPokemon}`);
    }, 1000);

    return () => clearTimeout(delay); // if the input changes before 1 sec, start new time
  }, [searchPokemon, navigate]);



  //this function fetches the pokemon from the favorites json
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch("http://localhost:8000/favorites"); //get request
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();
        setFavorites(data);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []); //empty dependency array=code runs once, after component is mounted

  //function to request delete from server sending the id of the pokemon
  const deleteFromFavorites = async (id: number) => {
  try {
    const response = await fetch(`http://localhost:8000/favorites/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Fail to delete!');
    }

    //using the setFavorites, filter the list and remove the pokemon locally
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  } catch (err) {
    alert((err as Error).message);
  }
}

const surprise = () => {
    const randomID = Math.floor(Math.random()*151) + 1;
    navigate((`/pokemon/${randomID}`));
};

  if (loading) return <p>Loading favorites...</p>;
  if (error) return <p>{error}</p>;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPokemon) {
     navigate(`/pokemon/${searchPokemon}`);
    }
  }

  return (
    <div>
      <div className="logo">
        <Link to="/"><h1 className="pokebase">PokeBase</h1></Link>
        <Link to="/"><img style={{height:"10vh"}} src="../public/logo.png" alt="hat"/></Link>
      </div>
      <h2 className="button-color-font" style={{marginTop:"0.1vh"}}>Your Favorite Pokémons</h2>

       <form onSubmit={handleSearchSubmit}>
          <input className="searchbar" style={{marginTop:'15px'}} type="text" placeholder="Search a Pokemon...🔍" value={searchPokemon} onChange={(e)=>setSearchPokemon(e.target.value)}></input>
       </form>

       <button className="button-color-font" style={{marginTop:'15px'}} onClick={() => surprise()}>Surprise me!</button>

      {favorites.length === 0 ? (
        <p className="button-font-color">What are you waiting for? Add your favorite pokemons here!</p>
      ) : (
        <ul className="pokemon-display" style={{listStyle:'none'}}>
          {favorites.map((fav) => (
            <li key={fav.id}>
              <div className="id-name-center" style={{ backgroundColor:"#808080", border: "4px solid gold", padding: "10px", borderRadius: "13px",  boxShadow: "0 4px 8px gold"}}>
                <img  src={fav.frontSprite} alt={fav.name} />
                <p className="mouse-over"style={{color:'#FFD700'}}> {fav.id}. <Link className="button-color-font"style={{fontSize:'20px'}} to={`/pokemon/${fav.id}`}>{fav.name}</Link></p>
                <button className="card button-color-font" style={{background:"linear-gradient(#4040a1,#8d8db7)"}} onClick={() => deleteFromFavorites(fav.id)} >Delete from Favorites</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <footer>
              <p>© Copyright  | PokeBase</p>
              <p>Fotogiannopoulos Dimitrios</p>
        </footer>
    </div>
  );
}
