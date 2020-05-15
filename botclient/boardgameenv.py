import copy
import random
import gym
from gym import spaces

import games.othello as othello
import numpy as np


class BoardGameEnvironment(gym.Env):
    def __init__(self, game):
        self.game = game



    def render(self, mode='human', close=False):
        print('========')
        print(self.game.to_printable_string())
        

    def observation(self):
        pass


class OthelloEnvironment(BoardGameEnvironment):

    metadata = {'render.modes': ['human']}

    def __init__(self, game=None):
        if game is None: game = othello.Othello()
        super(OthelloEnvironment, self).__init__(game)
        self.action_space = spaces.Discrete(64)
        self.observation_space = spaces.Box(low=0, high=1, shape=(2, 8, 8), dtype=np.uint8)
        self.invalid_move = False

    def reset(self):
        othello.Othello.__init__(self.game, first_player=random.randint(0, 1))
        self.invalid_move = False
        if self.game.current_player() == 1: 
            self.make_opposing_move()
        return self.observation()


    def step(self, action):
        if not self.action_space.contains(action):
            raise ValueError(f'{action} not in action_space for Othello')

        if self.game.current_player() != 0:
            raise Exception('Step made while not turn for bot to play')

        row = action // 8
        col = action % 8
        move = othello.Move(0, (row, col))

        if not self.game.is_valid_move(move):
            self.invalid_move = True
        else:
            self.game.apply_move(move)
            self.make_opposing_move()

        return self.observation()


    def observation(self):
        if self.invalid_move:
            return (self.game.snapshot(), -100, True, self.debug_info())
        observation = self.game.snapshot()
        reward = 0
        done = self.game.game_over()

        if done:
            winner = self.game.winner()
            if winner == 0: reward = 10000
            if winner == 1: reward = -10000

        reward += self.game.piece_diff()
        return (observation, reward, done, self.debug_info())


    def debug_info(self, done=False, invalid_move=False):
        return {
                "piece_diff": self.game.piece_diff(),
                "invalid_move": invalid_move,
                "action_mask": self.action_mask() if not done else [],
                }


    def action_mask(self):
        mask = np.ones(64)
        valid_moves = self.game.valid_moves()
        for move in valid_moves:
            action_idx = move.space[0] * 8 + move.space[1]
            mask[action_idx] = 0
        return mask



    def make_opposing_move(self):
        def diff_after(move):
            game = copy.deepcopy(self.game)
            game.apply_move(move)
            return -1 * game.piece_diff()

        def pick_best_move(moves):
            return max(moves, key=diff_after)

        def random_choice_with_merits(moves):
            diffs = [diff_after(m) for m in moves]

            boost = abs(min(diffs))
            weights = [x + boost + 1 for x in diffs]

            sum_diff = sum(weights)
            weights = [x / sum_diff for x in weights]

            return np.random.choice(moves, p=weights)

        while self.game.current_player() == 1:
            valid_moves = self.game.valid_moves()
            if not valid_moves: break
            opposing_move = random_choice_with_merits(valid_moves)
            self.game.apply_move(opposing_move)

            # If our only move is PASS, make the PASS and continue
            valid_moves = self.game.valid_moves()
            if valid_moves and valid_moves[0].space is None:
                self.game.apply_move(valid_moves[0])
            else:
                break


