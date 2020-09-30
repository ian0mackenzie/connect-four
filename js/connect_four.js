"use strict";
jQuery(document).ready(function($) {

//	Grab the game board markup. and set "player_0" to be first. Note I like to use the $var_name convention to denote jQuery objects.

	var $game_board_markup = $("#gameBoard");

//	Create a player object. Note all players will have AI capability.
	function player(player_color,difficulty) {

		this.player_color = player_color;
		this.difficulty = difficulty;

		this.make_move = function(){

			var players_sequences = [];
			var hypothetical_game_board_state = game_board.get_game_board_state_copy();
			players_sequences[0] = game_board.return_all_sequences(0);
			players_sequences[1] = game_board.return_all_sequences(1);
			var possible_moves = game_board.get_possible_moves();
			var extending_move;
			var move_number = null;
			var more_moves;
			var move_found = false;
			var cpus_choice;

			var assess_move_results = function(hypothetical_game_board_state, move){

				var p0_hypothetical_moves;
				var p0_max_sequence;
				var y = 0;
				var four_discovered = false;

				game_board.set_spot_value(move[0],move[1],hypothetical_game_board_state,1);

				for( var x = 0; x <= 6; x++ ){
					y = game_board.get_first_valid_row(x,hypothetical_game_board_state);
					if(y != null && y >= 0 && y <= 5){
						game_board.set_spot_value(x,y,hypothetical_game_board_state,0);					
						p0_hypothetical_moves = game_board.return_all_sequences(0,hypothetical_game_board_state);
						p0_max_sequence = game_board.return_max_sequence(p0_hypothetical_moves);

						game_board.unset_spot_value(x,y,hypothetical_game_board_state);
						if(p0_max_sequence.seq_length > 3)
							four_discovered = true;
					}
				}

				return four_discovered;
				
			}

			var examine_possible_sequence_length = function(game_board_state, sequence){

				var possible_length = 0;
				var counter = 0;
				var sequence_owner = game_board.get_spot_value(sequence.starting_point[0], sequence.starting_point[1]);

				if( sequence.seq_type == "horizontal" ) {

					while( (sequence.starting_point[0]-counter-1 >= 0) && (game_board.get_spot_value(sequence.starting_point[0]-counter-1, sequence.starting_point[1]) === null || game_board.get_spot_value(sequence.starting_point[0]-counter-1, sequence.starting_point[1]) === sequence_owner) ){
						counter++;
					}

					possible_length = counter;
					counter = 0;

					while( (sequence.ending_point[0]+counter+1 <= 6) && (game_board.get_spot_value(sequence.ending_point[0]+counter+1, sequence.ending_point[1]) === null || game_board.get_spot_value(sequence.ending_point[0]+counter+1, sequence.ending_point[1]) === sequence_owner) ){
						counter++;
					}
					possible_length += counter;
				}

				if( sequence.seq_type == "vertical" ) {
					while( (sequence.ending_point[1]-counter-1 >= 0) && (game_board.get_spot_value(sequence.ending_point[0], sequence.ending_point[1]-counter-1) === null || game_board.get_spot_value(sequence.ending_point[0], sequence.ending_point[1]-counter-1) === sequence_owner) ){
						counter++;
					}
					possible_length = counter+sequence.seq_length-1;
				}

				if( sequence.seq_type == "diagonal-up"  ) {
					while( (sequence.starting_point[0]+counter+1 <= 6) && (sequence.starting_point[1]-counter-1 >= 0)  && (game_board.get_spot_value(sequence.starting_point[0]+counter+1, sequence.starting_point[1]-counter-1 ) === null || (game_board.get_spot_value(sequence.starting_point[0]+counter+1, sequence.starting_point[1]-counter-1 ) === sequence_owner) )){
						counter++;
					}

					possible_length = counter;
					counter = 0;

					while( (sequence.starting_point[0]-counter-1 >= 0) && (sequence.starting_point[1]+counter+1 <= 5)  && (game_board.get_spot_value(sequence.starting_point[0]-counter-1, sequence.starting_point[1]+counter+1 ) === null || (game_board.get_spot_value(sequence.starting_point[0]-counter-1, sequence.starting_point[1]+counter+1) === sequence_owner) )){
						counter++;
					}
					possible_length += counter;

				}

				if( sequence.seq_type == "diagonal-down" ) {

					while( (sequence.starting_point[0]+counter+1 <= 6) && (sequence.starting_point[1]+counter+1 <= 5)  && (game_board.get_spot_value(sequence.starting_point[0]+counter+1, sequence.starting_point[1]+counter+1 ) === null || (game_board.get_spot_value(sequence.starting_point[0]+counter+1, sequence.starting_point[1]+counter+1 ) === sequence_owner) )){
						counter++;
					}

					possible_length = counter;
					counter = 0;

					while( (sequence.starting_point[0]-counter-1 >= 0) && (sequence.starting_point[1]-counter-1 >= 0)  && (game_board.get_spot_value(sequence.starting_point[0]-counter-1, sequence.starting_point[1]-counter-1 ) === null || (game_board.get_spot_value(sequence.starting_point[0]-counter-1, sequence.starting_point[1]-counter-1) === sequence_owner) )){
						counter++;
					}
					possible_length += counter;

					console.log(sequence);
				}
				sequence.possible_length = possible_length+1;
			} // end examine_possible_sequence_length

//			Start procedural logic
			for(var i = 0; i < players_sequences[0].length; i++ ){
				examine_possible_sequence_length(hypothetical_game_board_state,players_sequences[0][i]);
			}

			for(var i = 0; i < players_sequences[1].length; i++ ){
				examine_possible_sequence_length(hypothetical_game_board_state,players_sequences[1][i]);
			}

			if(this.difficulty == "dumb"){
				move_found = true;
				cpus_choice = [Math.floor(Math.random() * 7), 0, 0 ,0 ];

				cpus_choice[1] = game_board.get_first_valid_row(cpus_choice[0]);
				while (cpus_choice[1] < 0 || cpus_choice[1] == null){
					cpus_choice = [Math.floor(Math.random() * 7), 0, 0 ,0 ];
					cpus_choice[1] = game_board.get_first_valid_row(cpus_choice[0]);
				}
			} else {

				possible_moves.forEach( function(possible_move, move_index ){
					possible_move[2] = 0;
					possible_move[3] = 0;
					players_sequences.forEach(function(player_sequences, player_sequences_index){
						player_sequences.forEach(function( sequence, player_sequence_index ){

							extending_move = null;

								if(sequence.open_start === true){
									switch(sequence.seq_type) {
										case "horizontal":
												extending_move = [sequence.starting_point[0]-1, sequence.starting_point[1]];
											break;
										case "diagonal-up":
												extending_move = [sequence.starting_point[0]+1, sequence.starting_point[1]-1];
											break;
										case "diagonal-down":
												extending_move = [sequence.starting_point[0]-1, sequence.starting_point[1]-1];
											break;
									}
									if( extending_move != null &&  possible_move[0] === extending_move[0] && possible_move[1] === extending_move[1] ){

										if(sequence.seq_length >= 3 && player_sequences_index === 1){
											cpus_choice = [extending_move[0], extending_move[1], 0, 0 ];
											move_found = true;
										}
										possible_move[2+player_sequences_index]++;
									}
								}

								if (sequence.open_end === true){

									switch(sequence.seq_type) {
										case "horizontal":
												extending_move = [sequence.ending_point[0]+1, sequence.ending_point[1]];
											break;
										case "vertical":
												extending_move = [sequence.ending_point[0], sequence.ending_point[1]-1];
											break;
										case "diagonal-up":
												extending_move = [sequence.ending_point[0]+1, sequence.ending_point[1]-1];
											break;
										case "diagonal-down":
												extending_move = [sequence.ending_point[0]+1, sequence.ending_point[1]+1];
											break;
									}

									if( extending_move != null && possible_move[0] === extending_move[0] && possible_move[1] === extending_move[1] ){
										if(sequence.seq_length >= 3){

											cpus_choice = [extending_move[0], extending_move[1], 0, 0 ];
											move_found = true;
										}
										possible_move[2+player_sequences_index]++;
									}
								}

						});
					});


				});
			}

			possible_moves.sort(function (x, y) {
			    var n = y[2] - x[2];
			    if (n != 0) {
			        return n;
			    }

			    return y[3]-x[3];
			});

			move_number = 0;

			if(possible_moves.length > 0){
				more_moves = true;
			}

			if(move_found === false){
				if (game_board.get_spot_value(3,5) === null) {
					move_found = true;
					cpus_choice = [3,5,0,0];
				}
			}

			while( typeof possible_moves[move_number] !== "undefined" && move_found == false){
				cpus_choice = possible_moves[move_number];
				if (!(assess_move_results(hypothetical_game_board_state, cpus_choice))){
					move_found = true;
				}
				move_number++;
			}

			return cpus_choice;

		}

	}

	function game_board_object(){

		var game_board_state = get_fresh_board_array();
		var whose_turn = 0;

//		Create a fresh board array
		function get_fresh_board_array(){

			var fresh_board_array = [];

			for(var i = 0; i <=5; i++ ){
				fresh_board_array[i] = [];
				for(var j = 0; j<=6; j++){
					fresh_board_array[i][j] = null;
				}
			}

			return fresh_board_array;
		}

		this.reset_board = function(){
			for(var i = 0; i <=5; i++ ){
				for(var j = 0; j<=6; j++){
					this.set_spot_value(j,i,game_board_state,null);
				}
			}

		}

		this.check_for_tie = function(){
			var null_found;
			var theval = null;

			for(var i = 0; i <=5; i++ ){
				for(var j = 0; j<=6; j++){
					theval = this.get_spot_value(j,i);

					if(theval == null){
						null_found = true;
					}
				}
			}

//			return the opposite of what we were searching for (nulls).
			return (null_found === true) ? false : true;

		}

		this.get_spot_value = function(x,y){
			return( game_board_state[y][x] );
		}

		this.set_spot_value = function(x,y,game_board_state_ut,for_who){
			game_board_state_ut = (typeof game_board_state_ut === "undefined" )? game_board_state : game_board_state_ut;
			for_who = (typeof for_who === "undefined" )? whose_turn : for_who;
			game_board_state_ut[y][x] = for_who;
		}

		this.unset_spot_value = function(x,y,game_board_state_ut){
			game_board_state_ut = (typeof game_board_state_ut === "undefined" )? game_board_state : game_board_state_ut;
			game_board_state_ut[y][x] = null;
		}

		this.get_game_board_state = function(){
			return game_board_state;
		}

		this.get_game_board_state_copy = function(game_board_state_ut){

			game_board_state_ut = (typeof game_board_state_ut === "undefined" )? game_board_state : game_board_state_ut;
			var game_board_copy = [];
			for (var i = 0; i < game_board_state.length; i++)
			    game_board_copy[i] = game_board_state_ut[i].slice();
			return game_board_copy;

		}

		this.move_to_next_turn = function(){
			whose_turn ^= 1;
		}

		this.get_first_valid_row = function(x, game_board_state_ut){

			game_board_state_ut = (typeof game_board_state_ut === "undefined" )? game_board_state : game_board_state_ut;

			var valid_y = 5;
			var spot_value = game_board_state_ut[valid_y][x];

			while(spot_value !== null && valid_y > 0){
				valid_y--;
				spot_value = game_board_state_ut[valid_y][x];
			}

			return (spot_value === null) ? valid_y : null;
		}

		this.flatten_game_board_state = function(){
//			Found this flattening technique on stack overflow.
			return [].concat.apply([], game_board_state);
		}

		this.update_board_markup = function(){

			var flat_game_board_state = this.flatten_game_board_state();

			$("td", $game_board_markup).each(function(key) {
				if( flat_game_board_state[key] !== null ) {
					$(this).addClass( 'player_'+flat_game_board_state[key] )
					$(this).removeClass('player_null player_undefined');
				} else {
					$(this).removeClass('player_0 player_1');
				}
			});
			
		}

		this.get_possible_moves = function(game_board_state_ut){
			game_board_state_ut = (typeof game_board_state_ut === "undefined" )? game_board_state : game_board_state_ut;
			var possible_moves = [];
			var y = null;

			for(var i=0; i<7; i++){
				y = this.get_first_valid_row(i,game_board_state_ut);
				if(y != null){
					possible_moves.push([i,y]);
				}
			}

			return possible_moves;
		}



		this.return_max_sequence = function(sequences){

			var max_sequence = sequences[0];
			sequences.forEach(function(current_sequence){
				if(current_sequence.seq_length > max_sequence.seq_length){
					max_sequence = current_sequence;
				}
			});

			return max_sequence;
		}

		this.return_all_sequences = function(check_who, game_board_state_ut){

//			Switched to this check instead of the || check because I decided I want to pass in 0 for player 0
			check_who = (check_who === null )? whose_turn : check_who;
			game_board_state_ut = (typeof game_board_state_ut === "undefined" )? game_board_state : game_board_state_ut;
/*
			I am going to use a similar checking strategy that I used when writing
			a verzion of Battle Ship for an embedded systems class. We will
			look at each of the pieces and assess the sequence length/direction.
			An optimization option might be to only run this on the spot that changed
			after a move, but I'm going to assess all spots to use for the CPU strategy.
*/
			var sequences = [];

			var sequence = function(seq_type, threat_left, threat_right, seq_length, starting_point, ending_point,possible_length){
				this.seq_type = seq_type;
				this.open_start = threat_left;
				this.open_end = threat_right;
				this.seq_length = seq_length;
				this.starting_point = starting_point;
				this.ending_point = ending_point;
				this.possible_length = null;
			}

			var open_start = null;
			var open_end = null;
			var total_length = 0;
			var possible_length = 0;
			var already_counted_horizontal = [];
			var already_counted_vertical = [];
			var already_counted_diagonal_up = [];
			var already_counted_diagonal_down = [];

			for(var yi = 0; yi < 6; yi++){

				already_counted_horizontal[yi] = [];
				if(typeof already_counted_vertical[yi] === "undefined" )
					already_counted_vertical[yi] = [];
				if(typeof already_counted_diagonal_up[yi] === "undefined" )
					already_counted_diagonal_up[yi] = [];
				if(typeof already_counted_diagonal_down[yi] === "undefined" )
					already_counted_diagonal_down[yi] = [];

				for(var xi = 0; xi < 7; xi++){
					if(game_board_state_ut[yi][xi] === check_who){

//						Check out the horizontal prospects
						if (typeof already_counted_horizontal[yi][xi] === 'undefined') {
							total_length = 1;

							while( (xi+total_length <= 6) && game_board_state_ut[yi][xi+total_length] === check_who ){
								already_counted_horizontal[yi][xi+total_length] = true;
								total_length++;
							}
	
							if (yi !== 5){
								open_start = (xi-1 >= 0 && game_board_state_ut[yi][xi-1] === null && game_board_state_ut[yi+1][xi-1] !== null) ? true : false;
								open_end = (xi+total_length+1 <= 6 && game_board_state_ut[yi][xi+total_length] === null && game_board_state_ut[yi+1][xi+total_length] !== null) ? true : false;
							} else {
								open_start = (xi-1 >= 0 && game_board_state_ut[yi][xi-1] === null) ? true : false;
								open_end = (xi+total_length+1 <= 6 && game_board_state_ut[yi][xi+total_length] === null) ? true : false;
							}
							sequences.push(new sequence("horizontal", open_start, open_end, total_length, [xi, yi], [xi+total_length-1,yi,possible_length]));
						}
						total_length = 1;

//						Check out the vertical prospects.
						if(typeof already_counted_vertical[yi][xi] === 'undefined'){
							already_counted_vertical[yi][xi] = true;
							while( (yi+total_length <= 5) && game_board_state_ut[yi+total_length][xi] === check_who ){
								if(typeof already_counted_vertical[yi+total_length] === "undefined" )
									already_counted_vertical[yi+total_length] = [];
								already_counted_vertical[yi+total_length][xi] = true;
								total_length++;
							}


							open_end = (yi-1 >= 0 && game_board_state_ut[yi-1][xi] === null) ? true : false;
							sequences.push(new sequence("vertical", null, open_end, total_length, [xi, yi+total_length-1], [xi,yi]) );

						}
						total_length = 1;

//						Check out the diagonal-up prospects.
						if(typeof already_counted_diagonal_up[yi][xi] === 'undefined'){
							already_counted_diagonal_up[yi][xi] = true;
							while( (yi+total_length <= 5 && xi-total_length >= 0 ) && game_board_state_ut[yi+total_length][xi-total_length] === check_who ){
								if(typeof already_counted_diagonal_up[yi+total_length] === "undefined" )
									already_counted_diagonal_up[yi+total_length] = [];
								already_counted_diagonal_up[yi+total_length][xi-total_length] = true;
								total_length++;
							}


							open_end = ((yi-1 >= 0 && xi+1<=6 ) && game_board_state_ut[yi-1][xi+1] === null && game_board_state_ut[yi][xi+1] !== null) ? true : false;
							open_start = ( (xi-total_length >= 0 && yi+total_length+1 <=5) && game_board_state_ut[yi+total_length][xi-total_length] === null  && game_board_state_ut[yi+total_length+1][xi-total_length] !== null ) ? true : false;

							sequences.push(new sequence("diagonal-up", open_start, open_end, total_length, [xi-total_length+1, yi+total_length-1], [xi,yi]) );
							
						}
						total_length = 1;

//						Check out the diagonal-down prospects.
						if(typeof already_counted_diagonal_down[yi][xi] === 'undefined'){
							already_counted_diagonal_down[yi][xi] = true;
							while( (yi+total_length <= 5 && xi+total_length >= 0 ) && game_board_state_ut[yi+total_length][xi+total_length] === check_who ){
								if(typeof already_counted_diagonal_down[yi+total_length] === "undefined" )
									already_counted_diagonal_down[yi+total_length] = [];
								already_counted_diagonal_down[yi+total_length][xi+total_length] = true;
								total_length++;
							}


							open_start = ((yi-1 >= 0 && xi-1>=0 ) && game_board_state_ut[yi-1][xi-1] === null && game_board_state_ut[yi][xi-1] !== null) ? true : false;
							open_end = ( (xi+total_length <= 6 && yi+total_length <=5) && game_board_state_ut[yi+total_length][xi+total_length] === null) ? true : false;
							sequences.push(new sequence("diagonal-down", open_start, open_end, total_length, [xi, yi], [xi+total_length-1,yi+total_length-1]) );

						}


					}

				}

			}

			return sequences;
		}

	}

//	Create the human player
	var player_0 = new player("yellow");
//	Create the CPU player
	var player_1 = new player("red","dumb");
//	Create the game board!
	var game_board = new game_board_object();

	$(".restart input").on("click", function(){
		game_board.reset_board();
		game_board.update_board_markup();
	});

//	The main click handler
	$game_board_markup.on("click", "td", function(){

		var p0_sequences;
		var p1_sequences;
		var x = $(this).siblings().addBack().index($(this));
		var y = $(this).parent().siblings().addBack().index($(this).parent());
		var current_game_board;
		var cpus_choice;
		var largest_sequence;
		
		var first_valid_row = game_board.get_first_valid_row(x);

		player_1.difficulty = $("#aIDifficulty").val();

		if(first_valid_row !== null ){
			game_board.set_spot_value(x,first_valid_row);
			game_board.update_board_markup();

			largest_sequence = game_board.return_max_sequence(game_board.return_all_sequences(0));

			if (largest_sequence.seq_length > 3) {
				alert("The game is over! You have won! Click OK to restart");
				game_board.reset_board();
				game_board.update_board_markup();
			} else if (game_board.check_for_tie() == true ) {
				alert("The game ended in a tie! Click OK to restart.");
				game_board.reset_board();
				game_board.update_board_markup();
			}

			game_board.move_to_next_turn();

			current_game_board = game_board.get_game_board_state();
			cpus_choice = player_1.make_move();
			
			game_board.set_spot_value(cpus_choice[0],cpus_choice[1]);
			game_board.update_board_markup();
			largest_sequence = game_board.return_max_sequence(game_board.return_all_sequences(1));
			
			if ( largest_sequence.seq_length > 3) {
				alert("The game is over! CPU has won. Click OK to restart.");
				game_board.reset_board();
				game_board.update_board_markup();
			} else if (game_board.check_for_tie() == true ) {
				alert("The game ended in a tie! Click OK to restart.");
				game_board.reset_board();
				game_board.update_board_markup();
			}
			game_board.move_to_next_turn();

		}
	});
});