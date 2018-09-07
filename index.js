'use strict';
/*global axios, moment $ */


const userInfo = [
  {
    'id': 52146611,
    'name': 'Evan Garrett',
    'startingScore': 17777
  },
  {
    'id': 51780307,
    'username': 'Clessie',
    'startingScore': 6062
  },
  {
    'id': 407853977,
    'username': 'Bekah Stillwell',
    'startingScore':10310
  },
  {
    'id': 402249718,
    'username': 'Jodi',
    'startingScore': 2730
  },
  {
    'id': 223811089,
    'username': 'Becca Dawson',
    'startingScore': 650
  },
  {
    'id': 405763753,
    'username': 'Tami Garrett',
    'startingScore': 630
  },
  {
    'id': 408117925,
    'username': 'Lynn Stillwell',
    'startingScore': 2590
  },
  {
    'id': 414117383,
    'username': 'Crystal Hankin',
    'startingScore': 539
  }
];




const duo = {

  users:[],
  //Counts the amount of API calls made in one session
  call_count: 0,

  previousUserInfo:JSON.parse(localStorage.getItem('userInfo')) || null,


  
  levelstartingPoints: userArr => {
    userArr.forEach(user => {
      const currentUser = userInfo.find(_user => _user.id === user.id);
      if (currentUser) {
        return user.points_data.total-= currentUser.startingScore;
      }
    });
  },

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

        duo.levelstartingPoints(userData);

        // Calculate Gains
        userData.forEach(user => {
          user.gains = duo.previousUserInfo && duo.previousUserInfo.find(prevUserRecord => prevUserRecord.id === user.id ) ? user.points_data.total - duo.previousUserInfo.find(item => item.id === user.id).points_data.total: '-';
          user.gains = !isNaN(user.gains) ? user.gains.toFixed(0) : user.gains;
          user.gains < 0 ? user.gains = 0 : user.gains = user.gains;
        });

        // Sort by highest score
        userData.sort((a,b) => {
          return Number(a.points_data.total) < Number(b.points_data.total);
        });

        // If the user array is populated, don't entirely replace, but update point information based on new API results
        if (duo.users.length) {
          duo.users.forEach(user => {
            let userDataInstance = userData.find(item => item.id === user.id);
            user.points_data.total = userDataInstance.points_data.total;
            user.gains = userDataInstance.gains;
          });

          localStorage.setItem('userInfo', JSON.stringify(duo.users));
          duo.previousUserInfo = duo.users;

          
        } else {
          duo.users = userData;
          localStorage.setItem('userInfo', JSON.stringify(duo.users));
          duo.previousUserInfo = duo.users;

        }
        
        // If this is the first call, set the user streak/language bubbles to loading
        // Otherwise, render them as not loading 
        if (duo.call_count === 0) {
          duo.writeToDom(duo.users,true);
        } else {
          duo.users.sort((a, b) => {
            return Number(a.points_data.total) < Number(b.points_data.total);
          });
          duo.writeToDom(duo.users,true);
        }
        $('.loader-container').css('display','none');
       
       
        // if (duo.call_count === 0) {

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
                user.points_data.total = ((user.streak / 100) * user.points_data.total) + user.points_data.total;
                user.points_data.total = Number(user.points_data.total).toFixed(0);
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
            console.log(`Update ${duo.call_count} completed on ${new Date()}`);
            // Write HTML to DOM
            duo.writeToDom(duo.users,false);
            // Remove Loader
            duo.call_count++;
          });
        // }

        
        
      })
      .catch(err => {
        console.log(err);
        $('.loader-container').css('display','none');
        $('.duo-container').html(duo.errorHtml);
        duo.call_count = 0;
      });

  },

  userBlockHtml: (name, points, avatar, streak='-', learningLanguage='-', index, username, loading, gains) => { 
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
            Points: <div class='points-number'>${points}</div>
          </div>
          <div class='streak'>
            Streak:
            <div class='streak-bubble ${loading ? 'pulse':''}'>
            ${streak} days
            </div>
          </div>
          <div class='learning'>
          Learns:
            <div class='learning-bubble ${loading ? 'pulse':''}'>
            ${learningLanguage}
            </div>
          </div>
          <div class='gains' alt='The Amount of points the user has earned since you last checked with this browser.'>
          Gains:
            <div class='gains-bubble  ${loading ? 'pulse':''}'>
            ${gains}
            </div>
          </div>
        </div>
    </div>
    `; 
  },
  errorHtml: '<div class=\'error-box\'> <h2> Error </h2> <h5><u> Please try to reload the page.</u> </h5> And if that doesn\'t work, the API is probably down and you\'ll have to try again later. Sorry!  </p> <br> <button onclick="duo.fetchUserInfo()" class=\'retry-button btn btn-primary\'>Retry?</button></div>',

  writeToDom: (arrOfUsers,loading) => {
    let htmlString = '';
    arrOfUsers.forEach((item,index) => {
      htmlString+= duo.userBlockHtml((item.fullname && item.fullname.length < 23 ? item.fullname : item.username), item.points_data.total,item.avatar, item.streak, item.learningLanguage, index, item.username, loading, item.gains);
    });
    $('.duo-container').html(htmlString);
  },
  writeTime: () => {
    $('.time-left').text(` Competition ends ${moment(new Date('9/28/18 17:00').getTime()).fromNow()}!`);
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


