import requests
import time

class GameRef:
    def __init__(self, game_id, player_id=1, url_base='http://localhost:8080'):
        self.game_id = game_id
        self.url_base = url_base
        self.player_id = player_id
        self.prev_valid_moves = None
        self.prev_game_info = None


    def game_url(self, route=''):
        return f'{self.url_base}/api/games/{self.game_id}{route}'


    def game_info(self, invalidate_cache=False):
        if invalidate_cache or self.prev_game_info is None:
            r = requests.get(self.game_url())
            self.prev_game_info = r.json()
            self.prev_valid_moves = None
        return self.prev_game_info


    def valid_moves(self, invalidate_cache=False):
        if invalidate_cache or self.prev_valid_moves is None:
            r = requests.get(self.game_url('/validMoves'))
            self.prev_valid_moves = r.json()
        return self.prev_valid_moves


    def spin_until_turn(self):
        while True:
            print('Checking if my turn')
            moves = self.game_info(True)['moves']
            if self.is_my_turn():
                break
            else:
                time.sleep(1)
            

    def is_my_turn(self):
        moves = len(self.game_info()['moves'])
        return (1 - moves % 2) != self.player_id

        
    def make_move(self, move):
        move_index = len(self.game_info()['moves'])
        r = requests.post(self.game_url(f'/moves/{move_index}'), json=move)
        print(r)
        

