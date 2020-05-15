from collections import deque
import random

import numpy as np
import numpy.ma as ma

import tensorflow
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Flatten, Dense, Conv2D
from tensorflow.keras.optimizers import Adam, Nadam


class QActor:
    def __init__(self, model):
        self.model = model
        self.history = deque(maxlen=64000)
        self.learn_mod = 0


    def get_action(self, state, action_mask=None, epsilon=0):
        if action_mask is None:
            return self.get_actions([state], None, epsilon)
        return self.get_actions([state], [action_mask], epsilon)


    def get_actions(self, states, action_masks=None, epsilon=0):
        x = np.array(states)
        y = np.array(self.model(x))
        if action_masks is None: action_masks = np.zeros(y.shape)

        choices = ma.masked_array(y, mask=action_masks).argmax(axis=1)


        # Epsilon randomness
        for case_idx in range(len(x)):
            if random.random() >= epsilon:
                """
                if len(states) == 1:
                    print('         Making move', '%2d' % choices[0], 'I expect to get me', '%6.2f' % y[0][choices[0]])
                """
                continue
            choices[case_idx] = random.choice([
                    action_idx
                    for action_idx, masked in enumerate(action_masks[case_idx])
                    if not masked
                    ])
            """
            if len(states) == 1:
                print('EPSILON: Making move', '%2d' % choices[0], 'I expect to get me', '%6.2f' % y[0][choices[0]])
            """

        return choices


    def run_once(self, env, learn=False, epsilon=0, render=True, verbose=1):
        state, reward, done, info = env.reset()

        while not done:
            if render: env.render()

            action_mask = info.get('action_mask', None)
            action = self.get_action(state, action_mask, epsilon)[0]

            next_state, reward, done, info = env.step(action)
            if verbose: print(action, '=>', reward, done)
            next_action_mask = info.get('action_mask', None)
            self.history.append((state, action_mask, action, reward, next_state, next_action_mask, done))

            if learn:
                self.learn()

        if render: env.render()
        self.post_run(info, verbose=verbose)
        return reward


    def train(self, env, render=True, verbose=1):
        epsilon = 1
        epsilon_decay = .9995
        epsilon_min = .01

        games_played = 0
        games_won = 0
        recent = { n: deque(maxlen=n) for n in (10,100,1000) }

        while True:
            end_reward = self.run_once(env, learn=True, epsilon=epsilon, render=render, verbose=verbose == 2)
            won = (env.game.winner() == 0)
            for n in recent:
                recent[n].append(won)
            games_played += 1

            if won: games_won += 1
            if verbose and games_played % 1 == 0:
                print('Playing with epsilon=%.4f' % epsilon, end=' ')
                print('%8d' % end_reward, 'W ' if won else ' L', end=' ')
                print('%d/%d (%.2f)' % (games_won, games_played, games_won / games_played), end='   ')

                for n in recent:
                    n_won = sum(recent[n])
                    n_len = len(recent[n])
                    if n_len == n:
                        print('%4d/%d' % (n_won, n_len), end='  ')
                print()

            epsilon *= epsilon_decay
            epsilon = max(epsilon_min, epsilon)


    def post_run(self, info, verbose=0):
        return


    def learn(self, batch_size=16, discount=.9, verbose=0):
        if self.learn_mod != 0: self.learn_mod -= 1; return
        self.learn_mod = 10

        if len(self.history) < batch_size: return
        batch = random.sample(self.history, batch_size)
        states, action_masks, actions, rewards, next_states, next_action_masks, dones = zip(*batch)

        states = np.array(states)

        state_preds = self.model.predict(states)
        next_preds = self.model.predict(next_states)

        for idx, action in enumerate(actions):
            if dones[idx]:
                q_learned = rewards[idx]
            elif next_action_masks is not None:
                masked = ma.masked_array(next_preds[idx], mask=next_action_masks[idx])
                q_learned = rewards[idx] + discount * np.amax(masked)
            else:
                q_learned = rewards[idx] + discount * np.amax(next_preds[idx])

            state_preds[idx][action] = q_learned

        self.model.fit(states, state_preds, verbose=0)
        

class OthelloQActor(QActor):
    def __init__(self, model_path='models/othelloqactor.h5'):
        model = Sequential()
        """
        model.add(Conv2D(8, (8, 8), padding='same', data_format='channels_first', activation="relu", input_shape=(2, 8, 8)))
        model.add(Conv2D(8, (5, 5), padding='same', data_format='channels_first', activation="relu", input_shape=(2, 8, 8)))
        model.add(Conv2D(8, (3, 3), padding='same', data_format='channels_first', activation="relu", input_shape=(2, 8, 8)))
        model.add(Flatten())
        """
        model.add(Flatten(input_shape=(2, 8, 8)))
        model.add(Dense(2048, activation='relu'))
        model.add(Dense(1024, activation='relu'))
        model.add(Dense(128, activation='relu'))
        model.add(Dense(64, activation='relu'))
        model.compile(optimizer=Nadam(), loss='mse')
        model.summary()
        QActor.__init__(self, model)


    def post_run(self, info, verbose):
        if verbose:
            print('Game Over! Piece diff:', info.get('piece_diff', 'unknown'))


