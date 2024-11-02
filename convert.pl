use strict;

my %translate = (
"Green Bay Packers" => "Packers",
"Chicago Bears" => "Bears",
"Atlanta Falcons"=> "Falcons", 
"Minnesota Vikings"=> "Vikings",
"Baltimore Ravens"=> "Ravens", 
"Miami Dolphins"=> "Dolphins",
"Buffalo Bills"=> "Bills", 
"New York Jets"=> "Jets",
"Kansas City Chiefs"=> "Chiefs", 
"Jacksonville Jaguars"=> "Jaguars",
"Los Angeles Rams"=> "Rams", 
"Carolina Panthers"=> "Panthers",
"Tennessee Titans"=> "Titans", 
"Cleveland Browns"=> "Browns",
"Washington Commanders"=> "Commanders", 
"Philadelphia Eagles"=> "Eagles",
"Cincinnati Bengals"=> "Bengals", 
"Seattle Seahawks"=> "Seahawks",
"Indianapolis Colts"=> "Colts", 
"Los Angeles Chargers"=> "Chargers",
"Detroit Lions"=> "Lions", 
"Arizona Cardinals"=> "Cardinals",
"New York Giants"=> "Giants", 
"Dallas Cowboys"=> "Cowboys",
"San Francisco 49ers"=> "49ers", 
"Tampa Bay Buccaneers"=> "Buccaneers",
"Pittsburgh Steelers"=> "Steelers", 
"New England Patriots"=> "Patriots",
"Houston Texans"=> "Texans", 
"New Orleans Saints"=> "Saints",
"Denver Broncos"=> "Broncos", 
"Las Vegas Raiders"=> "Raiders"
);

my $bye;


open my $input, "<season2020b.txt" or die "Cannot open input file";
open my $output, ">output.json" or die "Cannot open output file";

print $output "[\n";

my $weekCount = 0;
my $matchupCount = 0;

while(<$input>)
{
	my $cl = $_;
	
	if($cl =~ /^\s*Week (\d+)\s*$/)
	{
		if ($weekCount != 0)
		{
			print $output "\n\t\t],\n";
			print $output "\t\t\"bye\": [\"$bye\"],\n";
			print $output "\t\t\"designatedMatchUp\": [\"\", \"\"]\n";
			print $output "\t},\n";
		}
		$weekCount++;
		$matchupCount = 0;

		
		$bye = "";
		print $output "\t{\n";
		print $output "\t\t\"week\": $1,\n";
		print $output "\t\t\"matchups\": \n";
		print $output "\t\t[\n";
		
	}
	elsif ($cl =~ /(.+) at (.+)\,/)
	{
		if ($matchupCount != 0)
		{
			print $output ",\n";
		}
		$matchupCount++;
		# print $output "\t\t\t[\"$translate{$1}\", \"$translate{$2}\"]";
		print $output "\t\t\t[\"$1\", \"$2\"]";
	}
	elsif ($cl =~ /Bye\:\s+(.+)/)
	{
		$bye = $1;
	}
}

print $output "\n\t\t]\n";
print $output "\t\t\"bye\": [\"$bye\"],\n";
print $output "\t\t\"designatedMatchUp\": [\"\", \"\"]\n";
print $output "\t}\n";
print $output "]\n";

