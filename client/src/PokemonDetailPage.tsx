import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect} from "react";
import { useNavigate} from "react-router-dom";
import { Link } from "react-router-dom";

//help declaring the returning value in the function
type PokemonDetail = {
  id: number;
  name: string;
  frontSprite:string;
  backSprite:string;
  description:string;
};

type Pokemon = {
  id: number;
  name: string;
  frontSprite: string;
  backsprite: string;
}

//this function fetches all the needed detailed data using promises
//asynchronous function
async function fetchPokemonDetail(id: string): Promise<PokemonDetail | null> {
    try{
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) return null;
    const data = await res.json(); 
    
    if(data.id > 151) return null;



    //this 5 lines are used to fetch english description
    const speciesFetch = await fetch(data.species.url);
    if(!speciesFetch.ok) return null;

    const speciesJson = await speciesFetch.json();
    if (!speciesFetch.ok) throw new Error("Failed to fetch Pokémon species info");

    const englishEntry = speciesJson.flavor_text_entries.find(
        (entry: any) => entry.language.name === "en"
    );

    //replace the \f characters with spaces in all occurances

    //the description is inside the species,the entries is the
    //array with the descriptions and the flavor_text is the description 
    return {
        id: data.id,
        name: data.name,
        frontSprite: data.sprites.front_default,
        backSprite: data.sprites.back_default,
        description: englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : "No description available.", //thats a fallback
    }
    }catch(error){
        return null;
    }
}



//here the Detailed Pokemon Page is displayed using Tanstack Query
export function PokemonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery<PokemonDetail| null>({queryKey:["pokemonDetail", id], queryFn:() => fetchPokemonDetail(id!)});
  const [searchPokemon, setSearchPokemon] = useState('');
  const navigate = useNavigate();

  useEffect(() => { //run on [searchPokemon,navigate] change
    if (!searchPokemon) return; //nothing searched return

    const delay = setTimeout(() => { //start timer,if 1 sec passes navigate to the route
      navigate(`/pokemon/${searchPokemon}`);
    }, 1000);

    return () => clearTimeout(delay); // if the input changes before 1 sec, start new time
  }, [searchPokemon, navigate]);

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

  if (isLoading) return <p>Loading details...</p>;
  if (!data) return <p>Not Found.</p>;

  //handle search pokemon on submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchPokemon) {
     navigate(`/pokemon/${searchPokemon}`);
    }
  } 

  const surprise = () => {
    const randomID = Math.floor(Math.random()*151) + 1;
    navigate((`/pokemon/${randomID}`));
  };

  return (
    <div>
      <div className="logo">
        <Link to="/"> <h1 className="pokebase">PokeBase</h1> </Link>
        <Link to="/"> <img style={{height:"10vh"}} src="../public/logo.png" alt="hat"/> </Link>
      </div>
      <form style={{marginBottom:'20px'}} onSubmit={handleSearchSubmit}>
        <input className="searchbar" type="text" placeholder="Search a Pokemon...🔍" value={searchPokemon} onChange={(e)=>setSearchPokemon(e.target.value)}></input>
      </form>

      <button className="button-color-font" style={{marginTop:'15px',marginBottom:'15px'}} onClick={() => surprise()}>Surprise me!</button>

      <div style={{display:'flex', flexDirection:'row', justifyContent:'center', gap:'40px'}}>
        <img src={data?.frontSprite} alt={`${data?.name} front`} style={{height:'180px', width:'160px',  backgroundColor:"#808080", border: "4px solid gold", padding: "10px", borderRadius: "13px",  boxShadow: "0 4px 8px gold"}} />
        <img src={data?.backSprite} alt={`${data?.name} back`}  style={{height:'180px', width:'160px',  backgroundColor:"#808080", border: "4px solid gold", padding: "10px", borderRadius: "13px",  boxShadow: "0 4px 8px gold"}}/>
      </div>
      <h1 className="button-color-font" style={{fontSize:'1.5rem'}}>{data?.id}</h1>
      <p className="button-color-font" style={{fontSize:'1.5rem'}}>Description: {data?.description}</p>
      <button className="card button-color-font" style={{background:"linear-gradient(#4040a1,#8d8db7)"}} onClick={() => addToFavorites(data)}>Add to Favorites</button>
      <Link to="/favorites" className="favoritesButton">Check your favorites list</Link>
      <footer>
              <p>© Copyright  | PokeBase</p>
              <p>Fotogiannopoulos Dimitrios</p>
      </footer>
    </div>
  );
}