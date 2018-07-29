'use strict';
/*global axios, moment $ */

const duo = {

  users:[],
  //Counts the amount of API calls made in one session
  call_count: 0,
  
  // Fetches User Info from API, loops through, writes to DOM
  fetchUserInfo: () => {  

    if (duo.call_count === 0) {
      $('.loader-container').css('display','block');
    }
    $.getJSON({
      'url':'https://cors-anywhere.herokuapp.com/https://www.duolingo.com/users/evang522',
      'headers': {
        'x-requested-with':'friendface'
      }
    })
      .then(response => {
        const potentialLanguages = response.languages;
        let userData;
        

        let i=0;
        while (i<potentialLanguages.length) {
          if (response.language_data[potentialLanguages[i].language]) {
            userData = response.language_data[potentialLanguages[i].language]['points_ranking_data'];
            break;
          }
          i++;
        }

        // Loop through array of users and subtract Initial score (that the user had starting the competition) from their total score
        userData.forEach(item => {
          switch(item.id) {

          //evang522
          case 52146611:
            return item.points_data.total-= 10046; 
          //JoedKend
          case 6426706:
            return item.points_data.total-= 3384; 
          //Clessie
          case 51780307:
            return item.points_data.total-= 2564;
          //RebekahStillwell
          case 407853977:
            return item.points_data.total-= 600;
          //JodiGarret
          case 402249718:
            return item.points_data.total-= 950;
          //sousmarins
          case 223811089:
            return item.points_data.total-=650;
          //TamiGarret
          case 405763753:
            return item.points_data.total-=210;
          //LynnStillwell
          case 408117925:
            return item.points_data.total-=210;
          
          default:
            return item.points_data.total = item.points_data.total;
          }
        });

        // Sort by highest score
        userData.sort((a,b) => {
          return Number(a.points_data.total) < Number(b.points_data.total);
        });

        // If the user array is populated, don't entirely replace, but update point information based on new API results
        if (duo.users.length) {
          duo.users.forEach(user => {
            user.points_data.total = userData.find(item => item.id === user.id).points_data.total;
          });
        } else {
          duo.users = userData;
        }
        
        // If this is the first call, set the user streak/language bubbles to loading
        // Otherwise, render them as not loading 
        if (duo.call_count === 0) {
          duo.writeToDom(duo.users,true);
        } else {
          duo.writeToDom(duo.users,false);
        }
        $('.loader-container').css('display','none');
       
       
        if (duo.call_count === 0) {

          return new Promise((resolve,reject) => {
            let counter = 0;

            duo.users.forEach(user => {
              $.getJSON({
                'url':`https://cors-anywhere.herokuapp.com/https://www.duolingo.com/2017-06-30/users/${user.id}?fields=name,streak,learningLanguage&_=1532406936067`,
                'method':'GET',
                'headers': {
                  'x-requested-with':'friendface'
                }
              })
                .then(response => {
                  user.streak = response.streak;
                  user.learningLanguage = response.learningLanguage;
                  counter++;
                  if (counter === duo.users.length) {
                    return resolve();
                  }
                })
                .catch(err => {
                  reject(err);
                });

            });

          })
            .then(() => {

            // Write HTML to DOM
              duo.writeToDom(duo.users,false);
              // Remove Loader
              duo.call_count++;
            });
        }

      })
      .catch(err => {
        console.log(err);
        $('.loader-container').css('display','none');
        $('.duo-container').html(duo.errorHtml);
        duo.call_count = 0;
      });
  },

  userBlockHtml: (name, points, avatar, streak='-', learningLanguage='-', index, username, loading) => { 
    return `
    <div class="user-block-container col-sm-5 ${index===0 ? 'leader' : ''}">
      <div class='name'>
        ${name}
        <a href='https://duolingo.com/${username}' target="_blank">
        <img src='https:${avatar}/medium'>
        </a>
        </div>
        <div class='info-container'>
          <div class='points'>
            Points this Round: <div class='points-number'>${points}</div>
          </div>
          <div class='streak'>
            Streak:
            <div class='streak-bubble ${loading ? 'pulse':''}'>
            ${streak} days
            </div>
          </div>
          <div class='learning'>
          Learning:
          <div class='learning-bubble ${loading ? 'pulse':''}'>
          ${learningLanguage}
          </div>
          </div>
        </div>
    </div>
    `; 
  },
  errorHtml: '<div class=\'error-box\'> <h2> Error </h2> <h5><u> I had one job.</u> </h5> But really more likely the API isn\'t working. Sorry!  </p> <br> <button onclick="duo.fetchUserInfo()" class=\'retry-button btn btn-primary\'>Retry?</button></div>',

  writeToDom: (arrOfUsers,loading) => {
    let htmlString = '';
    arrOfUsers.forEach((item,index) => {
      htmlString+= duo.userBlockHtml(item.fullname||item.username, item.points_data.total,item.avatar, item.streak, item.learningLanguage, index, item.username, loading);
    });
    $('.duo-container').html(htmlString);
  },
  writeTime: () => {
    $('.time-left').text(` Competition ends ${moment(new Date('8/20/18 17:00').getTime()).fromNow()}!`);
  }
};


// Initialize App and begin initial network request

try {
  duo.fetchUserInfo();
  duo.writeTime();
} catch(e) {
  console.log('The following Error occured: ', e);

  // Display Error Message
  document.querySelector('.duo-container').innerHTML = duo.errorHtml;
  document.querySelector('.error-box').style.cssText='margin:auto';
  document.querySelector('.loader-container').style.cssText='display:none';
  
}

// Set Interval to re-query data every 90 seconds
setInterval(duo.fetchUserInfo, 90000);


