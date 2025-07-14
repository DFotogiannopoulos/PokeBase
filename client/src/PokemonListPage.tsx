import { useState, useEffect } from 'react';
import './App.css';
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from 'react-router-dom';

//this is a Generic type used to store each pokemon
type Pokemon = {
  id: number;
  name: string;
  frontSprite: string;
  backsprite: string;
}

// this function fetches 10 pokemons at a time and skip pokemons to fetch new ones using offset
async function fetchPokemonList(page: number): Promise<Pokemon[]> {
  const limit = 10;
  const offset = (page - 1) * limit;
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`); //wait for data-results to be fetched

  if (!res.ok) throw new Error("Failed to fetch Pokémon list");

  const data = await res.json(); //wait data fetched to transform into json

  const detailedPromises = data.results.map(async (pokemon: { name: string; url: string }, index: number) => {
  const detailsRes = await fetch(pokemon.url);
  if (!detailsRes.ok) throw new Error(`Failed to fetch details for ${pokemon.name}`);

  const details = await detailsRes.json();

  return {
      id: offset + index + 1,  // custom id starting from 1 on page 1
      name: pokemon.name,
      frontSprite: details.sprites.front_default,
    };

  });
  const detailedPokemon = await Promise.all(detailedPromises);

  return detailedPokemon; //returns list with pokemons and their characteristics
}

    

//here the Pokemon List Page is displayed using Tanstack query
export function PokemonListPage() {
  const [page, setPage] = useState(1);
  const [searchPokemon, setSearchPokemon] = useState ('');

  const {data, error, isLoading} = useQuery<Pokemon[]>({queryKey:["pokemonList", page], queryFn:() => fetchPokemonList(page)}); //uses the function to fetch the right pokemon depending on the page

  const navigate = useNavigate();

  useEffect(() => { //run on [searchPokemon,navigate] change
    if (!searchPokemon) return; //nothing searched return

    const delay = setTimeout(() => { //start timer,if 1 sec passes navigate to the route
      navigate(`/pokemon/${searchPokemon}`);
    }, 1000);

    return () => clearTimeout(delay); // if the input changes before 1 sec, start new time
  }, [searchPokemon, navigate]);


  //this function returns a random ID
  const surprise = () => {
    const randomID = Math.floor(Math.random()*151) + 1;
    navigate((`/pokemon/${randomID}`));
  };

  //request to server to add pokemon to favorites
  const addToFavorites = async (pokemon: Pokemon) => {
    try{
      //post request
      const response = await fetch('http://localhost:8000/add-favorite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: pokemon.id,
        name: pokemon.name,
        frontSprite: pokemon.frontSprite
      }),
    });

      const answer = await response.json();
      if (!response.ok) throw new Error(answer.error || "Failed to add to favorites!");

    }catch(error){
      alert("Error!");
    }
  }

  //show loading,whille waiting to fetch
  if (isLoading) {
     return <p>Loading...</p>
  }

  //If fetch fails show error message
  if (error) {
     return <p>Error loading Pokémon</p>
  }

  //refresh after last page
  if(page > 15 ){
    window.location.reload();
  }

  //handle search pokemon on submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPokemon) {
     navigate(`/pokemon/${searchPokemon}`);
    }
  }

  return (
      <div>
        <link href="https://fonts.cdnfonts.com/css/cartoon-free" rel="stylesheet"></link>
        <style>
          @import url('https://fonts.cdnfonts.com/css/cartoon-free');
        </style>

        <div className="logo">
          <Link to="/"><h1 className="pokebase" >PokeBase</h1></Link>
          <Link to="/"><img style={{height:"10vh"}} src="../public/logo.png" alt="hat"/></Link>
        </div>

        <Link to="/favorites" className='favoritesButton'>Check your favorites list</Link>

        <form onSubmit={handleSearchSubmit}>
          <input className='searchbar' style={{marginTop:'15px'}} type="text" placeholder="Search a Pokemon...🔍" value={searchPokemon} onChange={(e)=>setSearchPokemon(e.target.value)}></input>
        </form>

        <button className="button-color-font"   style={{marginTop:'15px'}} onClick={() => surprise()}>Surprise me!</button>

        <ul className="pokemon-display" style={{ listStyle: "none"}}>
              {data?.map((pokemon) => (
                <li key={pokemon.id}>
                  <div className="pokemon-card" >
                      <img src={pokemon.frontSprite} alt={pokemon.name}/>
                      <div className="mouse-over button-color-font">{pokemon.id}. <Link style={{fontSize:'20px',fontFamily:'CARTOON FREE,sans-serif',color:'#FFD700'}} to={`/pokemon/${pokemon.id}`}>{pokemon.name}</Link></div>
                      <button className="card button-color-font" style={{background:"linear-gradient(#4040a1,#8d8db7)"}} onClick={() => addToFavorites(pokemon)}>Add to Favorites</button>
                  </div>
                </li>
              ))}
        </ul>

        <div className="card">
          <button className="button-color-font" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <button className="button-color-font" onClick={() => setPage(page + 1)}>Next</button>

          <p className="button-color-font ">Current page: {page}</p>
        </div>
        <footer>
              <p>© Copyright  | PokeBase</p>
              <p>Fotogiannopoulos Dimitrios</p>
        </footer>
      </div>
    
  )
}



