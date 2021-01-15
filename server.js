// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const mongoose = require("mongoose")
const passport              =  require("passport"),
      bodyParser            =  require("body-parser"),
      LocalStrategy         =  require("passport-local"),
      passportLocalMongoose =  require("passport-local-mongoose"),
      User                  =  require("./models/user.js"),
      Avatar                  =  require("./models/avatar.js"),
      Admin                  =  require("./models/admin.js");
var flash = require('connect-flash');
const Movie = require("./models/addmovies.js")
const Series = require("./models/addseries.js")
const Episode = require("./models/addepisode.js")
const Season = require("./models/addseason.js")
const isImageUrl = require('is-image-url');
var cookieParser = require('cookie-parser');
const Discord = require("discord.js");



mongoose.connect(
 "mongodb+srv://hlamovies:brrogamer123@cluster0.xalra.mongodb.net/website",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
);


var fs = require("fs")

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.set('views', __dirname);

app.use(require("express-session")({
    secret:"HlaMovieS",       //decode or encode session
    resave: false,          
    saveUninitialized:false    
}));
passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cookieParser())




function json(url) {
  return fetch(url).then(res => res.json());
}


// https://expressjs.com/en/starter/basic-routing.html
app.get('/', async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  
  
  Movie.find({
    
  }).sort({ _id:-1 }).limit(6).exec((err, movies) => {
  if(err)console.log(err);
    Series.find({
    
  }).sort({ _id:-1 }).limit(6).exec((err, series) => {
  if(err)console.log(err);
	res.render('views/index.ejs', {
    user,
    movies,
    series,
    
  });
  })
  })
});

app.get("/discord", (req,res) => {
  res.redirect("https://discord.gg/zuND6httuv")
})

app.get("/instagram", (req,res) => {
  res.redirect("https://instagram.com/hlamovies/")
})


app.get("/login",(req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    res.render("views/login.ejs", {
      message: req.flash('loginMessage'),
      user
    });
});

app.get("/register",(req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    res.render("views/register.ejs", {
      user
    });
});

app.get("/login-error",(req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    res.render("views/login-error.ejs", {
      user
    });
});


app.post("/login",passport.authenticate("local",{

    failureRedirect:"/login-error",
  failureFlash: true
}),function (req, res){
   if (req.session.backURL) {
      const url = req.session.backURL;
      req.session.backURL = null;
      res.redirect(url);
    } else {
      res.redirect("/");
    }
});

app.post("/register",(req,res)=>{
    
    User.register(new User({_id: mongoose.Types.ObjectId(), username: req.body.username,email:req.body.email, password: req.body.password}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.render("views/username-error.ejs", {
              err
            });
        }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
    })
})

app.get("/logout",(req,res)=>{
    req.logout();
    res.redirect("/");
});

function goBack() {
  window.history.back();
}

function isLoggedIn(req,res,next) {
   if (req.isAuthenticated()) return next();
  req.session.backURL = req.url;
    res.redirect("/login");
}

app.get('/add-movie', isLoggedIn, async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  if(!user) return res.redirect("/")
  let Admins = await Admin.findOne({username: user.username})
 if(Admins) {
	res.render('views/add-movie.ejs', {
    user,
    Admins
  });
  } else {
    res.redirect('/')
  }
});

app.get('/add-series', isLoggedIn, async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  if(!user) return res.redirect("/")
   let Admins = await Admin.findOne({username: user.username})
 if(Admins) {
	res.render('views/add-series.ejs', {
     user,
    Admins
  });
  } else {
    res.redirect('/')
  }
});

app.get('/add-episode/:series', isLoggedIn, async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  let m = req.params.series;
  if(!user) return res.redirect("/")
  let Admins = await Admin.findOne({username: user.username})
 if(Admins) {
     
      Season.find({
    title: m
  }).sort({ _id:-1 }).exec(async(err, seasons) => {
  if(err)console.log(err);
	res.render('views/add-episode-by-series.ejs', {
     user,
    Admins,
    m,
    seasons
  })
       
     });
  } else {
    res.redirect('/')
  }
});

app.get('/add-episode/:series/season/:season', isLoggedIn, async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  let m = req.params.series;
  let s = req.params.season;
  if(!user) return res.redirect("/")
 let Admins = await Admin.findOne({username: user.username})
 if(Admins) {
      Series.findOne({
      title: m
    }, async (err, series) => {
        Season.findOne({
      season: s
    }, async (err, season) => {
	res.render('views/add-episode-by-season.ejs', {
      user,
    Admins,
    series,
    season
  })
        })
     });
  } else {
    res.redirect('/')
  }
});


app.get('/add-season', isLoggedIn, async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  if(!user) return res.redirect("/")
  let Admins = await Admin.findOne({username: user.username})
 if(Admins) {
     Series.find({
    
  }).sort([
    ['title','descending']
]).exec( async (err, series) => {
  if(err)console.log(err);
	res.render('views/add-season.ejs', {
     user,
    Admins,
    series
  })
     });
  } else {
    res.redirect('/')
  }
});

app.get('/add-season/:series', isLoggedIn, async (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  let m = req.params.series;
  if(!user) return res.redirect("/")
   let Admins = await Admin.findOne({username: user.username})
 if(Admins) {
      Series.findOne({
      title: m
    }, async (err, series) => {
	res.render('views/add-season-by-series.ejs', {
      user,
    Admins,
    series
  })
     });
  } else {
    res.redirect('/')
  }
});


app.post("/add-movie", isLoggedIn ,(req,res)=>{
  let webhook = new Discord.WebhookClient("799013159263535124", "8i46Xy7OL8ba2h3e1SibIB9JDhNiuJvWKEKFsRvf0mwHS5ftTnbMUi1tyfRjlndLiU-j");
  const title = req.body.title,
        image = req.body.image,
        date = req.body.date,
        duration = req.body.duration,
        age = req.body.age,
        categories = req.body.categories,
        rate = req.body.rate,
        story = req.body.story,
        watch = req.body.watch,
        download = req.body.download;
  const newMovie = new Movie({
    _id: mongoose.Types.ObjectId(),
    title: title,
    image: image,
    date: date,
    duration: duration,
    age: age,
    categories: categories,
    rate: rate,
    story: story,
    watch: watch,
    download: download
  });
  newMovie.save()
  res.redirect(`/movies/${title}`)
        
  let embed = new Discord.MessageEmbed()
  .setTitle("New Movie!")
  .setColor("#2f3136")
  .setThumbnail(image)
  .setDescription(`Title: \`${title}\`
  Date: \`${date}\`
  Duration: \`${duration}\`
  Age: \`${age}\`
  Categories: \`${categories}\`
  Rate: \`${rate}\`
  
  Story: \`${story}\``)
  
  webhook.send({
	embeds: [embed]
});
  
});

app.post("/add-series", isLoggedIn ,(req,res)=>{
  let webhook = new Discord.WebhookClient("799015608162320435", "Xo-fkXyTfJ42KDEopXq_c_NFJtTGEtn_FXo9LL95NZBfjPVv_OERamq86_kMZ96G63S2");
  const title = req.body.title,
        image = req.body.image,
        date = req.body.date,
        duration = req.body.duration,
        age = req.body.age,
        categories = req.body.categories,
        rate = req.body.rate,
        story = req.body.story
  
  const newSeries = new Series({
    _id: mongoose.Types.ObjectId(),
    title: title,
    image: image,
    date: date,
    duration: duration,
    age: age,
    categories: categories,
    rate: rate,
    story: story
  });
  newSeries.save()
  res.redirect(`/series/${title}`)
  
  let embed = new Discord.MessageEmbed()
  .setTitle("New Series!")
  .setColor("#2f3136")
  .setThumbnail(image)
  .setDescription(`Title: \`${title}\`
  Date: \`${date}\`
  Duration: \`${duration}\`
  Age: \`${age}\`
  Categories: \`${categories}\`
  Rate: \`${rate}\`
  
  Story: \`${story}\``)
  
  webhook.send({
	embeds: [embed]
});
        
});

app.post("/add-season", isLoggedIn ,(req,res)=>{
  let webhook = new Discord.WebhookClient("799016520969617448", "jOoG1PiRH--xoPxdSSI4sPVqLhO0nLk_VPLGrGv7UpVF3-LZet-zufs2lh4vuj1NQWSc");
  const title = req.body.series,
        season = req.body.season,
        image = req.body.image,
        date = req.body.date,
        duration = req.body.duration,
        age = req.body.age,
        categories = req.body.categories,
        rate = req.body.rate
        
  
  const newSeason = new Season({
    _id: mongoose.Types.ObjectId(),
    title: title,
    season: season,
    image: image,
    date: date,
    duration: duration,
    age: age,
    categories: categories,
    rate: rate,
  });
  newSeason.save()
  res.redirect(`/series/${title}/season/${season}`)
        
  let embed = new Discord.MessageEmbed()
  .setTitle("New Season!")
  .setColor("#2f3136")
  .setThumbnail(image)
  .setDescription(`Title: \`${title}\`
  Season: \`${season}\`
  Date: \`${date}\`
  Duration: \`${duration}\`
  Age: \`${age}\`
  Categories: \`${categories}\`
  Rate: \`${rate}\``)
  
  webhook.send({
	embeds: [embed]
});
  
});

app.post("/add-episode", isLoggedIn ,(req,res)=>{
  let webhook = new Discord.WebhookClient("799016767913328681", "kXHPzV3IZtnPJs4T_FpzCId8uoVPoSprkMcxHWGh9kIfxb4Jl4EIIRi-Z47r4UfhZ5io");
  const title = req.body.title,
        series = req.body.series,
        season = req.body.season,
        date = req.body.date,
        duration = req.body.duration,
        age = req.body.age,
        categories = req.body.categories,
        rate = req.body.rate,
        story = req.body.story,
        watch = req.body.watch,
        download = req.body.download;
  const newEpisode = new Episode({
    _id: mongoose.Types.ObjectId(),
    series: series,
    title: title,
    season: season,
    date: date,
    duration: duration,
    age: age,
    categories: categories,
    rate: rate,
    story: story,
    watch: watch,
    download: download
  });
  newEpisode.save()
  res.redirect(`/series/${series}/season/${season}/episode/${title}`)
  
  let embed = new Discord.MessageEmbed()
  .setTitle("New Episode!")
  .setColor("#2f3136")
  .setDescription(`Title: \`${title}\` | ${season} of ${series}
  Date: \`${date}\`
  Duration: \`${duration}\`
  Age: \`${age}\`
  Categories: \`${categories}\`
  Rate: \`${rate}\`
  
  Story: \`${story}\``)
  
  webhook.send({
	embeds: [embed]
});
        
});

app.post("/delete/movie/:movie", isLoggedIn ,(req,res)=>{
  
  
  const m = req.params.movie
  
 Movie.find({title: m}).deleteOne().exec();
  
 
    
                res.redirect(`/`)
                
  
  
        
});

app.post("/delete/series/:series", isLoggedIn ,(req,res)=>{
  
  
  const m = req.params.series
  
 Series.find({title: m}).deleteOne().exec();
  
 
    
                res.redirect(`/`)
                
  
  
        
});

app.post("/delete/series/:series/season/:season", isLoggedIn ,(req,res)=>{
  
  
  const m = req.params.series
  const s = req.params.season
  
  
  
 Season.find({title: m, season: s}).deleteOne().exec();
  
 
    
                res.redirect(`/`)
                
  
  
        
});

app.post("/delete/series/:series/season/:season/episode/:episode", isLoggedIn ,(req,res)=>{
  
  
  const m = req.params.series
  const s = req.params.season
  const e = req.params.episode
  
 
  
  
 Episode.find({series: m, season: s, title: e}).deleteOne().exec();
  
 
    
                res.redirect(`/`)
                
  
  
        
});

app.post("/edit-movie", isLoggedIn ,(req,res)=>{
  
  
  const title = req.body.title,
        titleold = req.body.titleold,
        image = req.body.image,
        date = req.body.date,
        duration = req.body.duration,
        age = req.body.age,
        categories = req.body.categories,
        rate = req.body.rate,
        story = req.body.story,
        watch = req.body.watch,
        download = req.body.download;
 
  Movie.findOne({
    title: titleold
  }, async (err, movie) => {
                
                movie.title = title
    movie.image = image
    movie.date = date
    movie.duration = duration
    movie.age = age
    movie.categories = categories
    movie.rate = rate
    movie.story = story
    movie.watch = watch
    movie.download = download
    
    movie.save()
                
                })
  
  
  res.redirect(`/movies/${title}`)
        
 
  
});

app.post("/edit-series", isLoggedIn ,(req,res)=>{
  
  
  const title = req.body.title,
        titleold = req.body.titleold,
        image = req.body.image,
        date = req.body.date,
        duration = req.body.duration,
        age = req.body.age,
        categories = req.body.categories,
        rate = req.body.rate,
        story = req.body.story,
        watch = req.body.watch,
        download = req.body.download;
 
  Series.findOne({
    title: titleold
  }, async (err, series) => {
                
                series.title = title
    series.image = image
    series.date = date
    series.duration = duration
    series.age = age
    series.categories = categories
    series.rate = rate
    series.story = story
    
    
    series.save()
                
                })
  
  
  res.redirect(`/series/${title}`)
        
 
  
});

app.post("/edit-season", isLoggedIn ,(req,res)=>{
  
  
  const title = req.body.title,
        titleold = req.body.titleold,
        season = req.body.season,
        seasonold = req.body.seasonold,
        series = req.body.series,
        seriesold = req.body.seriesold,
        image = req.body.image,
        date = req.body.date,
        duration = req.body.duration,
        age = req.body.age,
        categories = req.body.categories,
        rate = req.body.rate,
        story = req.body.story,
        watch = req.body.watch,
        download = req.body.download;
 
  Season.findOne({
    title: titleold,
    season: seasonold,
  }, async (err, seasonn) => {
                
                seasonn.title = title
    seasonn.season = season
    seasonn.image = image
    seasonn.date = date
    seasonn.duration = duration
    seasonn.age = age
    seasonn.categories = categories
    seasonn.rate = rate
   
   
    
    
    seasonn.save()
                
                })
  
  
  res.redirect(`/series/${title}/season/${season}`)
        
 
  
});

app.post("/edit-episode", isLoggedIn ,(req,res)=>{
  
  
  const title = req.body.title,
        titleold = req.body.titleold,
        season = req.body.season,
        seasonold = req.body.seasonold,
        series = req.body.series,
        seriesold = req.body.seriesold,
        image = req.body.image,
        date = req.body.date,
        duration = req.body.duration,
        age = req.body.age,
        categories = req.body.categories,
        rate = req.body.rate,
        story = req.body.story,
        watch = req.body.watch,
        download = req.body.download;
 
  Episode.findOne({
    title: titleold,
    season: seasonold,
    series: seriesold
  }, async (err, episode) => {
                
                episode.title = title
    episode.season = season
    episode.series = series
    episode.date = date
    episode.duration = duration
    episode.age = age
    episode.categories = categories
    episode.rate = rate
    episode.watch = watch
    episode.download = download
   
    
    
    episode.save()
                
                })
  
  
  res.redirect(`/series/${title}/season/${season}/episode/${title}`)
        
 
  
});



app.get("/movies/:movie", async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    let m = req.params.movie;
  let g = await Movie.aggregate([ { $sample: { size: 4 } } ])
  
    Movie.findOne({
      title: m
    }, async (err, movie) => {
     Movie.find({
    
  }).limit(4).exec(async(err, movies) => {
  if(err)console.log(err);
        
      
      res.render("views/movie.ejs", {
        movie,
        movies,
        user,
        Movie,
        g,
        
      })
    })
    })
});

app.get("/series/:series", async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    let m = req.params.series;
  let gg = await Series.aggregate([ { $sample: { size: 4 } } ])
  
    Series.findOne({
      title: m
    }, async (err, series) => {
     Season.find({
    title: m
  }).sort({ _id:-1 }).exec(async(err, seasons) => {
  if(err)console.log(err);
        
      
      res.render("views/series.ejs", {
        series,
        seasons,
        user,
        Series,
        gg,
        
      })
    })
    })
});

app.get("/series/:series/season/:season", async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    let m = req.params.series;
  let s = req.params.season;
  let gg = await Series.aggregate([ { $sample: { size: 4 } } ])
  
    Season.findOne({
      title: m,
      season: s
    }, async (err, season) => {
      Series.findOne({
      title: m,
    }, async (err, series) => {
     Episode.find({
    series: m,
       season: s
  }).sort({ _id:-1 }).exec(async(err, episodes) => {
         Season.find({
   title: m
  }).sort({_id: 1}).exec(async(err, seasons) => {
      
      res.render("views/season.ejs", {
        season,
        episodes,
        user,
        Series,
        gg,
        m,
        s,
        series,
        seasons
        
      })
         })
    })
    })
    })
});

app.get("/series/:series/season/:season/episode/:episode", async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    let m = req.params.episode;
  let s = req.params.series;
  let season = req.params.season;
  let gg = await Episode.aggregate([ { $sample: { size: 4 } } ])
  
    Episode.findOne({
      series: s,
      season: season,
      title: m
    }, async (err, episode) => {
      Series.findOne({
      title: s
    }, async (err, series) => {
     Episode.find({
    series: s,
       season: season
  }).sort({ _id:1 }).exec(async(err, episodes) => {
  if(err)console.log(err);
        
      
      res.render("views/episode.ejs", {
        episode,
        episodes,
        user,
        Episode,
        gg,
        series,
        season: req.params.season,
      })
    })
    })
    })
});

app.get("/edit/movie/:movie", isLoggedIn, async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    let m = req.params.movie;
  let g = await Movie.aggregate([ { $sample: { size: 4 } } ])
  
  if(!user) return res.redirect("/")
 let Admins = await Admin.findOne({username: user.username})
 if(!Admins) return res.redirect("/")
  
    Movie.findOne({
      title: m
    }, async (err, movie) => {
     Movie.find({
    
  }).limit(4).exec(async(err, movies) => {
  if(err)console.log(err);
        
      
      res.render("views/edit-movie.ejs", {
        movie,
        movies,
        user,
        Movie,
        g,
        
      })
    })
    })
});

app.get("/edit/series/:series", isLoggedIn, async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    let m = req.params.series;
  
    if(!user) return res.redirect("/")
 let Admins = await Admin.findOne({username: user.username})
 if(!Admins) return res.redirect("/")
	
    Series.findOne({
      title: m
    }, async (err, series) => {
    
        
      
      res.render("views/edit-series.ejs", {
        series,
        user,
        Movie,
        
        
      })
    
    })
});

app.get("/edit/series/:series/season/:season", isLoggedIn, async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    let m = req.params.series;
  let s = req.params.season;
  
    if(!user) return res.redirect("/")
 let Admins = await Admin.findOne({username: user.username})
 if(!Admins) return res.redirect("/")
	
    Season.findOne({
      title: m,
      season: s
    }, async (err, season) => {
    
        
      
      res.render("views/edit-season.ejs", {
        season,
        user,
        Movie,
        
        
      })
    
    })
});

app.get("/edit/series/:series/season/:season/episode/:episode", isLoggedIn, async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
    let m = req.params.series;
  let s = req.params.season;
  let e = req.params.episode
  
    if(!user) return res.redirect("/")
 let Admins = await Admin.findOne({username: user.username})
 if(!Admins) return res.redirect("/")
  
    Episode.findOne({
      title: e,
      season: s,
      series: m
    }, async (err, episode) => {
    
        
      
      res.render("views/edit-episode.ejs", {
        episode,
        user,
        Movie,
        
        
      })
    
    })
});



function captilaze(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

let genre = ["action", "adventure", "all", "comedy", "crime", "drama", "fantasy", "historical", "horror", "magical realism", "mystery", "paranoid fiction", "philosophical", "political", "romance", "saga", "satire", "science fiction", "social", "speculative", "thriller", "urban", "western"]

app.get("/movies/category/:category/page/:page", async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
  let cc = req.params.category;
    let m = captilaze(req.params.category);
  const resPerPage = 24; 
const page = req.params.page || 1;  

  if(!genre.includes(cc)) return res.redirect("/error")
  
 if(m !== "All") {
     
    Movie.find({
   categories : {$regex: new RegExp('.*' + m + '.*', 'i')}
  }).skip((resPerPage * page) - resPerPage)
      .limit(resPerPage).exec(async(err, movies) => {
  if(err)console.log(err);
        const numOfProducts = movies.length
      
       
        
      res.render("views/movies.ejs", {
        movies,
        user,
        Movie,
        m,
        page,
        cc,
   pages: Math.ceil(numOfProducts / resPerPage),
        numOfResults: numOfProducts,
        
      
    })
    
    })
    } else {
                      
       Movie.find({
   
  }).skip((resPerPage * page) - resPerPage)
      .limit(resPerPage).exec(async(err, movies) => {
  if(err)console.log(err);
         const numOfProducts = movies.length
         
      
      res.render("views/movies.ejs", {
        movies,
        user,
        Movie,
        m,
        page,
        cc,
   pages: Math.ceil(numOfProducts / resPerPage),
        numOfResults: numOfProducts,
        
      
    })
    
    })
      
    }
   
});


app.get("/serieses/category/:category/page/:page", async (req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
  let cc = req.params.category;
    let m = captilaze(req.params.category);
  const resPerPage = 24; 
const page = req.params.page || 1;  

  if(!genre.includes(cc)) return res.redirect("/error")
  
 if(m !== "All") {
     
    Series.find({
   categories : {$regex: new RegExp('.*' + m + '.*', 'i')}
  }).skip((resPerPage * page) - resPerPage)
      .limit(resPerPage).exec(async(err, series) => {
  if(err)console.log(err);
        const numOfProducts = series.length
      
       
        
      res.render("views/serieses.ejs", {
        series,
        user,
        Series,
        m,
        page,
        cc,
   pages: Math.ceil(numOfProducts / resPerPage),
        numOfResults: numOfProducts,
        
      
    })
    
    })
    } else {
                      
       Series.find({
   
  }).skip((resPerPage * page) - resPerPage)
      .limit(resPerPage).exec(async(err, series) => {
  if(err)console.log(err);
         const numOfProducts = series.length
         
      
      res.render("views/serieses.ejs", {
        series,
        user,
        Movie,
        m,
        page,
        cc,
   pages: Math.ceil(numOfProducts / resPerPage),
        numOfResults: numOfProducts,
        
      
    })
    
    })
      
    }
   
});



app.get("/manage-users",(req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
  if(!user) return res.redirect("/error")
  if(user.username === "HeemPlayz") {
   User.find({
    
  }).sort({ _id:-1 }).limit(4).exec((err, users) => {
  if(err)console.log(err);
    res.render("views/manage-users.ejs", {
      user,
      users
    });
   })
  } else {
    res.redirect("/error")
  }
});

app.get("/manage/:user",(req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
  const uu = req.params.user
  if(!user) return res.redirect("/error")
  if(user.username === "HeemPlayz") {
  User.findOne({
    username: uu
  }, async (err,u) => {
    Admin.findOne({
    username: uu
  }, async (err,admin) => {
  
  if(err)console.log(err);
    res.render("views/user.ejs", {
      user,
      u,
      admin
    });
   })
  })
  } else {
    res.redirect("/error")
  }
});

app.get("/profile", async(req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
  
  if(!user) return res.redirect("/login")
   let Admins = await Admin.findOne({username: user.username})
  User.findOne({
    username: user.username
  }, async (err,u) => {
    Avatar.findOne({
    username: user.username
  }, async (err,avatar) => {
    
  
  if(err)console.log(err);
    res.render("views/profile.ejs", {
      user,
      u,
      avatar,
      Admins
    });
   })
  })
});

app.post("/delete-account/:user", isLoggedIn ,(req,res)=>{
  
 const u = req.params.user
  
 User.find({username: u}).deleteOne().exec();
 
                res.redirect(`/manage-users`)
                   
});

app.post("/promote/:user", isLoggedIn ,(req,res)=>{
  
 const u = req.params.user
  
 const newAdmin = new Admin ({
   _id: mongoose.Types.ObjectId(),
   username: u
 })
 
 newAdmin.save()
 
                res.redirect(`/manage/${u}`)
                   
});

app.post("/demote/:user", isLoggedIn ,(req,res)=>{
  
 const u = req.params.user
  
 Admin.find({username: u}).deleteOne().exec();
 
                res.redirect(`/manage/${u}`)
                   
});



app.get("/manage-my-account", async(req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
  
  if(!user) return res.redirect("/login")
 
  User.findOne({
    username: user.username
  }, async (err,u) => {
    Avatar.findOne({
    username: user.username
  }, async (err,avatar) => {
    
  
  if(err)console.log(err);
    res.render("views/manage-my-account.ejs", {
      user,
      u,
      avatar
    });
   })
  })
});

app.get('/error-saving-avatar', (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
	res.render('views/error-saving-avatar.ejs', {
    user,
  });
 
});

app.post("/save-my-account/:user", isLoggedIn , async (req,res)=>{
  
 const u = req.params.user
  const newname = req.body.newname
  const newemail = req.body.newemail
  const newavatar = req.body.newavatar

  
 const UU = await User.findOne({username: u})
 
  if(!newavatar.startsWith("https") || !newavatar.startsWith("http")) return res.redirect("/error-saving-avatar")
  if(isImageUrl(newavatar) === false) return res.redirect("/error-saving-avatar")
 
 Avatar.findOne({
   username: u
 }, async (err,avatar) => {
   
 if(!avatar) {
   
   const newAvatar = new Avatar({
     _id: mongoose.Types.ObjectId(),
     username: u,
     avatar: newavatar
   })
   
   newAvatar.save()
   
    UU.username = newname
  UU.email = newemail
  UU.save()
   
   res.redirect(`/profile`)
 } else {
   
    UU.username = newname
  UU.email = newemail
  UU.save()
   
   avatar.avatar = newavatar
   avatar.save()
   
   res.redirect(`/profile`)
 }


  
  
 
 
                 res.redirect(`/profile`)
             })      
});






app.get("/statics", async(req,res)=>{
  const user = req.isAuthenticated() ? req.user : null;
  
 
 User.find({
    
  }).sort({ _id:-1 }).exec((err, users) => {
  if(err)console.log(err);
   Movie.find({
    
  }).sort([["title", "descending"]]).exec((err, movies) => {
  if(err)console.log(err);
     Series.find({
    
  }).sort([["title", "descending"]]).exec((err, series) => {
  if(err)console.log(err);
        Episode.find({
    
  }).sort([["title", "descending"]]).exec((err, episodes) => {
  if(err)console.log(err);
    res.render("views/statics.ejs", {
      user,
      users,
      movies,
      series,
      episodes
    });
 })
 })
 })
 })
});





app.get('/error-saving-avatar', (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
	res.render('views/error-saving-avatar.ejs', {
    user,
  });
 
});



app.get('/search/:search', (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  let search = req.params.search;
   Series.find({
   title : {$regex: new RegExp('.*' + search + '.*', 'i')}
  }).sort({_id: -1}).exec(async(err, series) => {
  if(err)console.log(err);
     Movie.find({
   title : {$regex: new RegExp('.*' + search + '.*', 'i')}
  }).sort({_id: -1}).exec(async(err, movies) => {
  if(err)console.log(err);
	res.render('views/search.ejs', {
    user,
    series,
    movies,
    search
  })
   })
   })
});

app.post('/search', (req, res) => {
  let search = req.body.search
  if(!search) return res.redirect("/search")
  res.redirect(`/search/${search}`)
})


app.get('/search', (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
  const search = req.params.search
	res.render('views/search.ejs', {
    user,
    search
  });
 
});



app.get('*', (req, res) => {
  const user = req.isAuthenticated() ? req.user : null;
	res.render('views/error.ejs', {
    user,
  });
 
});
// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
