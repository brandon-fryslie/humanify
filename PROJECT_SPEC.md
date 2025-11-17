here are some here that need to be fixed.  Critical issues:
- #1 huge problem: Do NOT delete the checkpoints!  We should find some way of isolating the checkpoints for a particular run so the directories don't conflict and they don't get 
mixxed up, but right now we are deleting the checkpoiints after every batch!  that means we can never restart the application on a crash, because the checkpoints have already been 
deleted!!!  huge problem.  Do not delete any checkpoints.  I've manually backed up some of them to avoid wasting more money on API calls
- #2 even bigger problem...it's looking like we are not even using the results of our API calls in the outputted code!  The outputted code (in output) is full of single letter 
variables.  I would not expect to see ANY single letter variables after a single run, let alone a 2nd refinement run!  What's going on here?!  When I manually inspect a checkpoint, I
 see code with some identifiers with regular names...those don't seem to show in the actual code in the output directory
- #3 Also big problem - Is it possible that the 'refinement' stage is starting over completely?  Due to the way it's set up, it looks like it creates ANOTHER output directory 
entirely!  How it should be working is that any refinement stages (ultimately we may want to refine an arbitrary number of times) should use as INPUT the already-processed code from 
the previous decompilation!  it looks like we might just be running it right off the original code and dumping a new output directory which is NOT what we want!  
- #4 There are way too many single letter and obviously undeobfuscated identifiers in the output!  how is this possible?  Where are the results of the API calls even going?!  I feel 
like this is just dumping money down the drain and we are throwing away the results.  Please save ALL results in a way we can reply them again, as well as audit them to compare the 
output with the actual data returned by the API
- #5 The progress output is passable but still pretty bad.  it continually flickers between "Processing..." with a progress bar and a "Progress x/y" display.  It's incredibly 
difficult to read either of them.  Each "UI element" should be displayed in a fixed width section.  These elements should be on separate lines when they might overlap.  Use color to 
draw attention to important information.  Avoid flickering.  
- $6 There is no indication whatsoever how much priogress we are making through the actual application as a whole.  We have a percentage, which is better than nothing.  but it seems 
to be only for the current batch, or the current 'batch of batches' maybe.  It's not clear how many 'batches of batches' there will be.  This information should be derived (or 
estimated, if necessary, but ideally calculated) BEFORE we start processing ANY of this.  We should know how much work we have to do at the beginning before we process any of the 
data.  We don't need to know how long it will take but we should have an idea of things like how many requests we will need to make, how many batches, batches of batches, batches of 
batches of batches, batches^4, etc.  If we need to rearrange some of the analysis, so be it.  We don't need to know everything but we should have a rough idea.
- #7 The refine stage is NOT simply 'running the same stuff again'.  It needs to take the previous state as input rather than the original file.  It needs to be a first class citizen
 in the display.  We can't just start the same code again and show no indication to the user we're refining.  What we need to be always displaying from the beginning is this info:
- Iteration: n
  - 'Iteration' will refer to how many times we've processed the data, ie, whether it's the first time (Iteration: 1), or whether we're refining the initial translation (Iteration: 
2+).  Use color to indicate which iteration were on.  Iteration: 1 == yellow.  Iteration 2 or higher, bright blue
  - A global progress bar that gives us our overall % progress taking into account ALL batches for all iterations.  We might not know with 100% certainy the total number of batches 
or 'size' of the next iteration, but once we know the first iteration size (sum of all batch sizes) we can directly estimate by multipling it by the number of 'batches of batches'.  
Calculate this for the entire codebase BEFORE sending ANY requests to the OpenAI API.  Be more comprehensive and global in the progress tracking.  I should see a global progress bar 
start at 0% and when it reaches 100% ALL processing is finsihed completely.
  - Keep the per-batch progress bar but improve it so it's not overlapping with other text.  this looks really bad and is hard to read
  - Print a nice looking summary of stats after every batch of batches is complete (every progress bar).  Include the number of tokens we processed
  - Again, use color to draw the eye to important info

This release needs to be completely focused on 2 things: Figuring out why my deobfuscated code looks exactly like it's still obfuscated, and making the output much easier to read and
 understand 



