from pprint import pprint

from api import GameRef
from boardgameenv import OthelloEnvironment
from firstchoiceactor import FirstChoiceActor
from qactor import OthelloQActor
from randomactor import RandomActor

from games.othello import Othello

def main():
    actor = OthelloQActor()
    env = OthelloEnvironment()
    train(actor, env)

def test_api():
    game = GameRef(input('Game Ref: '))
    #othello = Othello.from_api_json(game.game_info())
    print(othello.piece_counts())

    actor = RandomActor(game)
    actor.play()

def train(actor, env):
    actor.train(env, render=False, verbose=1)


def play(actor, env):
    games_played = 0
    games_won = 0
    while True:
        won = actor.run_once(env, render=False, verbose=0) == 1
        games_played += 1

        if won: games_won += 1
        if games_played % 10 == 0:
            print('Won!!' if won else 'Lost!','%3d / %3d (%.2f)' % (games_won, games_played, games_won / games_played))


if __name__ == '__main__':
    """
    import cProfile
    cProfile.run('main()')
    """
    main()


