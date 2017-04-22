module.exports = {
   realms: [
      {
         name: 'Hero School',
         locations: [
            {
               name: 'heroSchoolWelcome',
               description: 'Welcome to Hero School!',
               layout: [
                  ['button', 'Ok...', 'heroSchoolIntro'],
                  ['button', 'Get me out of here', 'heroSchoolWantToLeave']
               ]
            },
            {
               name: 'heroSchoolIntro',
               description: 'First, let\'s get you set up with some equipment',
               layout: [
                  ['button', 'Ok!', 'heroSchoolFirstWeapon']
               ]
            },
            {
               name: 'heroSchoolWantToLeave',
               description: 'Are you sure? You don\'t even want a weapon?',
               layout: [
                  ['button', 'Oh, yes please', 'heroSchoolFirstWeapon'],
                  ['button', 'No way!', 'heroSchoolExitUnhappy'],
               ]
            },
            {
               name: 'heroSchoolFirstWeapon',
               image: 'heroSchoolWeapons.png',
               description: 'Which weapon would you like?',
               isStatic: false,
               layout: [
                  ['button', 'Oh, yes please', 'heroSchoolFirstWeapon'],
                  {
                     items: {
                        type: 'starter'
                     },
                     each: {
                        type: 'button', 
                        text: '{{item.name}}', 
                        action: 'heroSchoolBattleIntro:{{item.name}}',
                        effect: {
                           player: {
                              acquire: [
                                 { item: '{{item}}', quantity: 1, equip: 'weapon' }
                              ]
                           }
                        }
                     }
                  }
               ]
            },
            {
               name: 'heroSchoolBattleIntro',
               description: 'Great! Would you like to try out a battle?',
               layout: [
                  ['button', 'Let\'s go!', 'heroSchoolExit:fight', {
                     game: { run: { startFight: ['Dummy'] } }
                  }],
                  ['button', 'Nah, get me out of here', 'heroSchoolExit']
               ]
            },
            {
               name: 'heroSchoolExit',
               description: 'Nice one! That concludes hero school. Good luck!',
               layout: [
                  ['button', 'Onward!', 'worldBegin']
               ]
            },
            {
               name: 'heroSchoolExitUnhappy',
               description: 'Alright well...Good luck out there!',
               layout: [
                  ['button', 'Onward!', 'worldBegin']
               ]
            }
         ]
      },
      {
         name: 'Grand Central',
         locations: [
            {
               name: 'worldBegin',
               description: 'Just outside of Hero School, the wind whistles by, slowly ruffling the oaks lining the entryway.',
               layout: []
            },
            {
               name: 'homeSweetHome',
               description: 'Home sweet home. Despite everything, that\'ll never change.',
               layout: [
                  ['button', 'Back to Grand Central', 'townSquare']
               ]
            }
         ]
      }
   ],
   enemies: [
      {
         name: 'Dummy',
         level: 1,
         health: 10,
         actions: ['Dawdle']
      }
   ],
   items: [
      {
         name: 'Sword',
         type: 'starter',
         stats: {
            level: 1,
            might: 2
         },
         actions: ['Slice']
      },
      {
         name: 'Bow',
         type: 'starter',
         stats: {
            level: 1,
            might: 2
         },
         actions: ['Shoot']
      },
      {
         name: 'Axe',
         type: 'starter',
         stats: {
            level: 1,
            might: 2
         },
         actions: ['Cleave']
      }
   ],
   actions: [
      {
         name: 'Slice',
         description: '[P] slices [E] for [D] damage!',
         prerequisites: { us: { distance: '< 10' } },
         effect: { enemy: { damage: '[player.might]' } }
      },
      {
         name: 'Shoot',
         description: '[P] shoots [E] for [D] damage!',
         prerequisites: { us: { distance: '> 10' } },
         effect: { enemy: { damage: '[player.might]' } }
      },
      {
         name: 'Cleave',
         description: '[P] cleaves [E] for [D] damage!',
         prerequisites: { us: { distance: '< 10' } },
         effect: { enemy: { damage: '[player.might]' } }
      },
      {
         name: 'Punch',
         description: '[P] punches [E]! Ow!',
         prerequisites: { us: { distance: '< 10' } },
         effect: { enemy: { damage: 1 } }
      },
      {
         name: 'Back off',
         description: '[P] backs off!',
         prerequisites: { us: { distance: '< 30' } },
         effect: { us: { distance: '+= 10' } }
      },
      {
         name: 'Close in',
         description: '[P] closes in!',
         prerequisites: { us: { distance: '> 0' } },
         effect: { us: { distance: '-= 10' } }
      },
      {
         name: 'Dawdle',
         description: '[P] dawdles about..',
         prerequisites: {},
         effect: {}
      }
   ]
}