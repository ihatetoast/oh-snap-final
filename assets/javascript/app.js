// STYLE RELATED F(X):
$(function() 
  {
    $("#circleBtn").mouseenter(function(e) {
        $(this).addClass("animated pulse"); 
    });
    $(".remove").mouseenter(function(e) {
      $(this).addClass("animated pulse"); 
  });
    $("#circleBtn").on("webkitAnimationEnd mozAnimationEnd oAnimationEnd animationEnd", function(e) {
        $(this).removeClass("animated pulse");
    });
  });
  

//click on food restriction icon and triggers api 
//also has array of food ingredients for food search and food restriction diet

//ingredients for recipe search
var ingredients=[];

$('.food-icon-restr').on('click', function() {
   var restrictDietChoice = this.id;
   runRestrictedDietAPI(restrictDietChoice, ingredients);
});

//runs restricted diet recipe search API
function runRestrictedDietAPI(restrictDietChoice, ingredients){
   var strIngredient = "";
   //concats array with wildcard for better api search
   $.each(ingredients, function(index,value){
       strIngredient += value +"%20";
   })
   var queryURL = `https://api.edamam.com/search?q=${strIngredient}&health=${restrictDietChoice}&app_id=2e4ce701&app_key=20b246a2d182f864dd85c155afc277d3`
   $.ajax({
       url: queryURL,
       method: "GET"
     }).done(function(response) {
       createRecipeCards(response);
     });    
};

 
  function createRecipeCards(response){
     $(".cardGroup").empty();
       $.each(response.hits, function(index, value){
        var hits = index;
          $(".cardGroup").append(`
            <div class="recipeCard">
              <div class="imgDiv">
                <img src="${value.recipe.image}" alt="${value.recipe.label}">
              </div>
              <div class="recipeLabel">
                <h5>${value.recipe.label}</h5>
              </div>
              <p class = "cals">Individual Serving Calories: ${parseInt(value.recipe.calories/value.recipe.yield)}</p>
              
              <button class="recipeBtn"><a href="${value.recipe.url}">Link to source</a></button>
              <button type="button" class="nutBtn" data-toggle="modal" data-target="#${hits}exampleModal">
              Ingredients
            </button>
            <!-- Modal -->
            <div class="modal fade" id="${hits}exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="${hits}exampleModalLabel">Ingredient List</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                  <ul id="${hits}">
                  </ul>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
              <button class="nutBtn"><a href='javascript:void(0);'>Nutritional Value</a></button>  
            </div>
             `)
            $.each(value.recipe.ingredients, function(index, value){
              
              $('#'+hits).append(`<li>${value.text}</li>`)  
            })
       });   
   }

 
var pantry = [];
// Initialize Firebase
var config = {
    apiKey: "AIzaSyBk2pHNz0EinDznYAMc6g_quxiE5uByHzQ",
    authDomain: "fir-proj-fc54a.firebaseapp.com",
    databaseURL: "https://fir-proj-fc54a.firebaseio.com",
    projectId: "fir-proj-fc54a",
    storageBucket: "fir-proj-fc54a.appspot.com",
    messagingSenderId: "936997790614"
};
firebase.initializeApp(config);
var database = firebase.database();

function pantryStorage(pantry){
    $.each(pantry, function(index,value){
        var pantryItem = {
            item: value,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        }
        database.ref("Pantry").push(pantryItem);
    });
    $("#temporaryPantry").empty();
    console.log('temp pantry emptied')
};

$("#pantry-input").on("click", function(event) {
  event.preventDefault();
 if($('#basics').val()==""){
    
    $('#lblPntry').text('Please enter something in text box');
    
  }else{
   
    $('#lblPntry').text('Enter Pantry Item:');
    
    // console.log($("#pantry-add").val().trim());
  $("#temporaryPantry").empty();
    pantry.push($("#basics").val().trim());
    $('#basics').val("");
    console.log(pantry);
    console.log("added to pantry");
    $.each(pantry, function(index,value){
      $("#temporaryPantry").append(`<li><i class="fa fa-cutlery" aria-hidden="true"></i> ${value}</li>`);
  });
}
      //add something tp clear out previour text
  });

$("#pantry-submit").on("click", function(event) {
    console.log("submitting pantry...");
    pantryStorage(pantry);
});

database.ref("Pantry").on("child_added", function(childSnapshot) {
    var expirationDT = moment().subtract(7, 'days').format('YYYY/MM/DD HH:mm:ss');
    var item = childSnapshot.val().item;
    var key = childSnapshot.key;
    if(moment(childSnapshot.val().dateAdded).format('YYYY/MM/DD HH:mm:ss') < expirationDT){
        $(".pantry-current").append(`<span class="pantry-item spoiled" id="${key}""><a href='javascript:void(0);' class='remove'>&cross;</a>${item}<a href='javascript:void(0);' class='add'>&check;</a><span>`);
    }else{
        $(".pantry-current").append(`
          <span class="pantry-item" id="${key}"">
            <a href='javascript:void(0);' class='remove'>&cross;</a>${item}<a href='javascript:void(0);' class='add'>&check;</a>
          </span>`);
    }
});

$(document).ready(function(){
  //remove pantry items from firebase database
  $(document).on("click", "a.remove" , function() {
    $(this).parent().remove();
    removeID = $(this).parent().attr("id");
    database.ref("Pantry/" + removeID).remove();
    console.log(`Removed ID: ${removeID}`);
  });
    //add pantry items to ingredient search list
    $(document).on("click", "a.add" , function() {
      var item = $(this).parent().text();
      //remove the special characters from the beginning and end of the ingredient
      item = item.slice(0, -1);
      item = item.substr(1);
      console.log($(this).attr("id"));
      if ($(this).attr("id") == "added") {
        console.log("Item removed: " + item);
        $(this).parent().css('background-color', 'transparent');
        var i = ingredients.indexOf(item);
        ingredients.splice(i, 1);//remove the clicked item fron the ingreidients search
        $(this).attr("id", "removed")
        console.log(ingredients);
      } else {
        console.log("Item added: " + item);
        $(this).parent().css('background-color', 'rgba(246, 65, 107, 0.2)');
        ingredients.push(item);
        console.log(ingredients);
        $(this).attr("id", "added")
      }
    });
  });

var input = document.getElementById("basics");
var awesomeplete = new Awesomplete(input);
function recipeapicallback(fillData) {
    awesomeplete.list = fillData;
}
var inString;
$('#basics').on('input', function() {
     inString = $(this).val();
    getAutocomplete(inString);
});
function getAutocomplete(inString){
    var queryURL = `http://api.edamam.com/auto-complete?q=${inString}&limit=10&app_id=cb021850&app_key=3f0c4b8c9adcb08d63cbde97230db9f8&callback=recipeapicallback`
    $.ajax({
        url: queryURL,
        method: "GET",
        dataType: 'jsonp'
      });
    
};
