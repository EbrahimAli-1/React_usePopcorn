import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const KEY = "6fcfb789";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedID, setSelectedID] = useState(null);
  const [focused, setFocused] = useState({});

  function addWatchedMovie(movie) {
    setWatched([...watched, movie]);
  }

  function deleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.id !== id));
  }

  function cancelMovie() {
    setSelectedID(null);
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovies() {
        try {
          setLoading(true);
          setError("");

          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );

          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not Found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
            console.log(err.message);
          }
        } finally {
          setLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      cancelMovie();
      fetchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <Nav>
        <Search query={query} setQuery={setQuery} />
        <Results movies={movies} />
      </Nav>

      <Main>
        <ListBox>
          {loading && <Loader />}
          {!loading && !error && (
            <MoviesList
              movies={movies}
              setSelectedID={setSelectedID}
              selectedID={selectedID}
              focused={focused}
              setFocused={setFocused}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </ListBox>

        <ListBox>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              setSelectedID={setSelectedID}
              addOnClick={addWatchedMovie}
              watched={watched}
              cancelMovie={cancelMovie}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList watched={watched} deleteWatched={deleteWatched} />
            </>
          )}
        </ListBox>
      </Main>
    </>
  );
}

function Nav({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Results({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length || 0}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ListBox({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MoviesList({
  movies,
  setSelectedID,
  selectedID,
  focused,
  setFocused,
}) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          setSelectedID={setSelectedID}
          selectedID={selectedID}
          focused={focused}
          setFocused={setFocused}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, setSelectedID, selectedID, focused, setFocused }) {
  function handleID() {
    setSelectedID((selectedID) =>
      selectedID === movie.imdbID ? null : movie.imdbID
    );
    setFocused({ backgroundColor: "#343a40" });
  }

  return (
    <li
      style={selectedID === movie.imdbID ? focused : {}}
      key={movie.imdbID}
      onClick={handleID}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function MovieDetails({
  selectedID,
  setSelectedID,
  addOnClick,
  watched,
  cancelMovie,
}) {
  const [movieData, setMovieData] = useState({});
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(null);

  const existed = watched.map((movie) => movie.id).includes(selectedID);
  const alreadyRated = watched.find(
    (movie) => movie.id === selectedID
  )?.userRating;

  function addWatchedMovie() {
    const newMovie = {
      id: movieData.imdbID,
      poster: movieData.Poster,
      title: movieData.Title,
      runtime: movieData.Runtime.split(" ").at(0),
      imdbRating: movieData.imdbRating,
      userRating: rating,
    };
    addOnClick(newMovie);
    cancelMovie();
  }

  useEffect(
    function () {
      async function movieDetails() {
        setLoading(true);

        const res = await fetch(
          `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`
        );

        const data = await res.json();
        setMovieData(data);
        setLoading(false);
      }

      movieDetails();
    },
    [selectedID]
  );

  useEffect(
    function () {
      if (!movieData.Title) return;
      document.title = `Movie | ${movieData.Title}`;

      return function () {
        document.title = "usePopcorn";
      };
    },
    [movieData]
  );

  useEffect(
    function () {
      function callBack(e) {
        if (e.code === "Escape") {
          cancelMovie();
        }
      }
      document.addEventListener("keydown", callBack);

      return function () {
        document.removeEventListener("keydown", callBack);
      };
    },
    [cancelMovie]
  );

  return (
    <div className="details">
      {loading && <Loader />}
      {!loading && movieData.length !== 0 ? (
        <>
          <header>
            <span className="btn-back" onClick={cancelMovie}>
              <svg
                fill="#000000"
                height="20px"
                width="20px"
                version="1.1"
                id="Layer_1"
                viewBox="0 0 476.213 476.213"
              >
                <g id="SVGRepo_iconCarrier">
                  <polygon points="476.213,223.107 57.427,223.107 151.82,128.713 130.607,107.5 0,238.106 130.607,368.714 151.82,347.5 57.427,253.107 476.213,253.107 "></polygon>{" "}
                </g>
              </svg>
            </span>
            <img src={movieData.Poster} alt="" />
            <div className="details-overview">
              <h2>{movieData.Title}</h2>
              <p>
                {movieData.Released} &bull; {movieData.Runtime}
              </p>
              <p>{movieData.Genre}</p>
              <p>⭐ {movieData.imdbRating} IMDb Rating</p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!existed ? (
                <StarRating maxRating={10} setRating={setRating} />
              ) : (
                <p style={{ textAlign: "center" }}>
                  You already watched this movie and you ranked it{" "}
                  {alreadyRated}⭐
                </p>
              )}
              {rating > 0 ? (
                <button className="btn-add" onClick={addWatchedMovie}>
                  + Add List
                </button>
              ) : (
                ""
              )}
            </div>
            <p>
              <em>{movieData.Plot}</em>
            </p>
            <p>Starring: {movieData.Actors}</p>
            <p>Directed by: {movieData.Director}</p>
          </section>
        </>
      ) : (
        ""
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length || 0} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{Number(avgImdbRating).toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Number(avgUserRating).toFixed(1)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Number(avgRuntime).toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, deleteWatched }) {
  return (
    <>
      <ul className="list">
        {watched.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.id}
            deleteWatched={deleteWatched}
          />
        ))}
      </ul>
    </>
  );
}

function WatchedMovie({ movie, deleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={() => deleteWatched(movie.id)}>
        x
      </button>
    </li>
  );
}
