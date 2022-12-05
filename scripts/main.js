// Declare variables/parameters for later use
let numberOfIncorrectGuesses = 0;
let numberOfBalloons = 7;
let currentGame;
let randomWord;
let blackoutScreenAlpha = 0;
let blackoutScreenMaxAlpha = 0.8;
let animationHandler;
let timeoutHandler;
let slimeFallDistance = 0;
let slimePosition;
let slimeFallRate = 0;


// Get all the elements that will be manipulated
const $blackout_screen              = $("#blackout_screen");
const $victory_article              = $("#victory_article");
const $defeat_article               = $("#defeat_article");
const $new_game_button              = $("#new_game_button");
const $slime_image                  = $("#slime_image");
const $slime_container              = $(".slime_container");
const $phone_image                  = $("#phone_image");
const $introduction_container       = $("#introduction_container");
const $hide_introduction_button     = $("#hide_introduction_button");
const $gameplay_inputs_container    = $("#gameplay_inputs_container");
const $guesses_container            = $("#guesses_container");
const $guesses_container_p_tag      = $("#guesses_container p");
const $hint_p_tag                   = $("#hint_container p");
const $remaining_balloons_span      = $("#remaining_balloons_span");
const $keyboard_container           = $("#keyboard_container");
const $letter_keys                  = $("#keyboard_container button");
const $blackout_section             = $("#blackout_section");
const $blackout_section_span        = $("#blackout_section span");


const words = {
    0:  {   word:"ooze",
            hint:"to drip slowly"
        },
    1:  {   word:"flubber",
            hint:"flying rubber" 
        },
    2:  {   word:"chartreuse",
            hint:"liqueur made by Carthusian monks"
        },
    3:  {   word:"kale",
            hint:"leafy 'superfood'"
        },
    4:  {   word:"collard",
            hint:"my cabbages!"
        },
    5:  {   word:"emerald",
            hint:"a variant of beryl"
        },
    6:  {   word:"lime",
            hint:"a sour fruit"
        },
    7:  {   word:"turquoise",
            hint:"an opaque birthstone"
        },
    8:  {   word:"greenland",
            hint:"a place covered in snow and ice"
        },
    9:  {   word:"lawn",
            hint:"a waste of space"
        },
    10: {   word:"pickle",
            hint:"a tasty snack"
        },
    11: {   word:"crocodile",
            hint:"a prehistoric creature"
        },
    12: {   word:"seaweed",
            hint:"something that wraps around your feet"
        },
    13: {   word:"envy",
            hint:"an emotion"
        },
    14: {   word:"frog",
            hint:"a delightful amphibian"
        }
    };

// Make a class for the game state (Word, hint)

class Game {
    constructor(word, hint) {
    this.word = word;
    this.hint = hint;
    this.revealedLetters = "*".repeat(word.length);
    };

    guess (letter) {
        let atLeastOneLetterFound = false;
        let revealedLettersArray = [...this.revealedLetters];

        // Go through all of the letters in the word one by one
        for (let i = 0; i<this.word.length; i++) {

            // If the letter in the word matches the guess,
            if (this.word[i].toLowerCase() == letter.toLowerCase()) {
                // Put the guessed letter into that position in the array.
                revealedLettersArray[i] = letter.toLowerCase();
                atLeastOneLetterFound = true;            
            };
        };

        // Convert the array back into a string and return it to the Game object:
        this.revealedLetters = revealedLettersArray.join('');

        return atLeastOneLetterFound;
    };
}

// Start the game!
startGame();

// Add event listeners
$hide_introduction_button.on("click", hideIntroduction);
$new_game_button.on("click", startGame);


// Define functions:

function reactToKeyboardInput () {
    $(this).off();

    // If .guess(letter) comes back as true:
    if (currentGame.guess($(this).text())) {
        // Update the DOM to show all the guessed letters
        $guesses_container_p_tag.text(currentGame.revealedLetters);
        // Then toggle the button to show that it was a bad guess
        $(this).toggleClass("right_letter");
    // Otherwise:
    } else {
        $(this).toggleClass("wrong_letter");
        // Pop a balloon
        numberOfIncorrectGuesses++;

        $(`#balloon_0${numberOfIncorrectGuesses}`).css("visibility","hidden");
        $remaining_balloons_span.text(`${numberOfBalloons-numberOfIncorrectGuesses}`);

        // Flash the red phone
        $phone_image.attr({
            src:"images/phone_error.png",
            alt:"The phone screen flashing red"
        }); 

        timeoutHandler = setTimeout(function(){
            $phone_image.attr({
                        src:"images/phone_locked.png",
                        alt:"A phone on the 'locked' screen"
                    });
        }, 500);
    };

    // Then check if the game is over:

    if (currentGame.revealedLetters.indexOf("*") == -1) {
        // Victory!

        $phone_image.attr({
            src:"images/phone_unlocked.png",
            alt:"A phone on the 'unlocked' home screen"
        });

        $blackout_screen.css("display","flex");
        $blackout_section_span.text(`${currentGame.word}`);
        animationHandler = requestAnimationFrame(fadeInEndScreen);
        $victory_article.css("display","flex");
        
        // Turn on the blackout screen and the victory article
    } else if (numberOfIncorrectGuesses == numberOfBalloons) {
        // Defeat...        

        $slime_image.attr({
            src:"images/slime_falling.png",
            alt:"a falling slime"
        }); 
        // Play the falling slime animation
        // turn on the blackout screen and the defeat article
        $slime_container.removeClass("animated");
        animationHandler = requestAnimationFrame(dropSlime);

    } else {

        if (numberOfIncorrectGuesses >= 6) {
            
            $slime_image.attr({
                src:"images/slime_03.png",
                alt:"a terrified slime"
            }); 

        } else if (numberOfIncorrectGuesses >= 4) {

            $slime_image.attr({
                src:"images/slime_02.png",
                alt:"an anxious slime"
            });

        } else if (numberOfIncorrectGuesses >= 2) {

            $slime_image.attr({
                src:"images/slime_01.png",
                alt:"a mildly content slime"
            });
        };


    };


}

function startGame () {
    $blackout_screen.css("display","none");
    $defeat_article.css("display","none");
    $victory_article.css("display","none");
    $blackout_section.css("display","none");
    $slime_container.css("visibility","visible");

    $slime_container.css({
        top: `0px`
    });

    $blackout_screen.css({
        backgroundColor: `rgba(0, 0, 0, 0)`,
    });

    randomWord = words[Math.floor(Math.random() * Object.keys(words).length)];

    currentGame = new Game (randomWord.word, randomWord.hint);

    $letter_keys.each(function(){
        $(this).off();
        $(this).removeClass("right_letter");
        $(this).removeClass("wrong_letter");
    });

    $letter_keys.each(function(){
        $(this).on("click", reactToKeyboardInput);
    });

    $guesses_container_p_tag.text(currentGame.revealedLetters);
    $hint_p_tag.text(`Hint: ${currentGame.hint}`);
    $remaining_balloons_span.text(numberOfBalloons);
    numberOfIncorrectGuesses = 0;

    for (let i = 1; i <= numberOfBalloons; i++) {
        $(`#balloon_0${i}`).css("visibility","visible");

    }

    $slime_image.attr({
        src:"images/slime_00.png",
        alt:"images/slime_00.png"
    });

    $phone_image.attr({
        src:"images/phone_locked.png",
        alt:"images/phone_locked.png"
    });}

function fadeInEndScreen (){

    if (blackoutScreenAlpha < blackoutScreenMaxAlpha) {
        blackoutScreenAlpha += 0.01;
        
        $blackout_screen.css({
            backgroundColor: `rgba(0, 0, 0, ${blackoutScreenAlpha})`,
        });

        animationHandler = requestAnimationFrame(fadeInEndScreen);

    } else {
        $blackout_section.css("display","flex");
        blackoutScreenAlpha = 0;
    };

};

function dropSlime (){
    // We use window.innerHeight here to make sure that the slime is off the screen before it disappears
    if (slimeFallDistance < 1.1 * window.innerHeight) { 
        // This finds the current "Top:" value for the slime container in pixels
        slimePosition = parseInt($slime_container.css('top'), 10);

        
        slimeFallRate += 2;
        console.log("slimeFallRate: ",slimeFallRate);
        slimePosition += slimeFallRate;
        console.log("slimePosition: ",slimePosition);

        slimeFallDistance = slimePosition;
        console.log("slimeFallDistance: ",slimeFallDistance);


    $slime_container.css({
        top: `${slimePosition}px`
    });

    animationHandler = requestAnimationFrame(dropSlime);

    } else {
        slimeFallRate = 0;
        slimeFallDistance = 0;
        slimePosition = 0;

        $slime_container.css("visibility","hidden");
        $slime_container.addClass("animated");

        $blackout_screen.css("display","flex");
        $blackout_section_span.text(`${currentGame.word}`);
        animationHandler = requestAnimationFrame(fadeInEndScreen);
        $defeat_article.css("display","flex");
    };
};


function hideIntroduction () {
    $introduction_container.css("display","none");
    $gameplay_inputs_container.css("display","block");
};