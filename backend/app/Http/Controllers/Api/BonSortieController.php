<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BonSortieLine;
use App\Models\Service;
use Illuminate\Http\Request;

class BonSortieController extends Controller
{
    public function show(Request $request)
    {
        $data = $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'month' => ['required', 'integer', 'between:1,12'],
            'year' => ['required', 'integer', 'between:2000,2100'],
        ]);

        $service = Service::findOrFail($data['service_id']);
        $lines = BonSortieLine::with('article')
            ->where('service_id', $service->id)
            ->where('month', $data['month'])
            ->where('year', $data['year'])
            ->orderBy('id')
            ->get()
            ->map(fn ($line, $index) => [
                'number' => $index + 1,
                'article' => $line->article->name,
                'ing' => $line->article->ing,
                'quantity' => $line->quantity,
                'quantity_words' => $this->numberToFrench($line->quantity),
            ]);

        return response()->json([
            'service' => $service,
            'month' => (int) $data['month'],
            'year' => (int) $data['year'],
            'bon_number' => sprintf('%03d/%d', $service->id, $data['year']),
            'lines' => $lines,
        ]);
    }

    private function numberToFrench(int $number): string
    {
        $formatter = class_exists(\NumberFormatter::class)
            ? new \NumberFormatter('fr_FR', \NumberFormatter::SPELLOUT)
            : null;

        if ($formatter) {
            return $formatter->format($number);
        }

        return $this->fallbackNumberToFrench($number);
    }

    private function fallbackNumberToFrench(int $number): string
    {
        if ($number < 0) {
            return 'moins '.$this->fallbackNumberToFrench(abs($number));
        }

        $units = [
            0 => 'zero',
            1 => 'un',
            2 => 'deux',
            3 => 'trois',
            4 => 'quatre',
            5 => 'cinq',
            6 => 'six',
            7 => 'sept',
            8 => 'huit',
            9 => 'neuf',
            10 => 'dix',
            11 => 'onze',
            12 => 'douze',
            13 => 'treize',
            14 => 'quatorze',
            15 => 'quinze',
            16 => 'seize',
        ];

        if ($number <= 16) {
            return $units[$number];
        }

        if ($number < 20) {
            return 'dix-'.$units[$number - 10];
        }

        if ($number < 100) {
            return $this->twoDigitsToFrench($number, $units);
        }

        if ($number < 1000) {
            $hundreds = intdiv($number, 100);
            $rest = $number % 100;
            $prefix = $hundreds === 1 ? 'cent' : $units[$hundreds].' cent';

            if ($rest === 0) {
                return $hundreds > 1 ? $prefix.'s' : $prefix;
            }

            return $prefix.' '.$this->fallbackNumberToFrench($rest);
        }

        if ($number < 1000000) {
            $thousands = intdiv($number, 1000);
            $rest = $number % 1000;
            $prefix = $thousands === 1 ? 'mille' : $this->fallbackNumberToFrench($thousands).' mille';

            return $rest === 0 ? $prefix : $prefix.' '.$this->fallbackNumberToFrench($rest);
        }

        if ($number < 1000000000) {
            $millions = intdiv($number, 1000000);
            $rest = $number % 1000000;
            $prefix = $millions === 1 ? 'un million' : $this->fallbackNumberToFrench($millions).' millions';

            return $rest === 0 ? $prefix : $prefix.' '.$this->fallbackNumberToFrench($rest);
        }

        return (string) $number;
    }

    private function twoDigitsToFrench(int $number, array $units): string
    {
        $tens = [
            20 => 'vingt',
            30 => 'trente',
            40 => 'quarante',
            50 => 'cinquante',
            60 => 'soixante',
        ];

        if ($number < 70) {
            $ten = intdiv($number, 10) * 10;
            $rest = $number % 10;

            if ($rest === 0) {
                return $tens[$ten];
            }

            return $tens[$ten].($rest === 1 ? ' et ' : '-').$units[$rest];
        }

        if ($number < 80) {
            return 'soixante'.($number === 71 ? ' et ' : '-').$this->fallbackNumberToFrench($number - 60);
        }

        if ($number === 80) {
            return 'quatre-vingts';
        }

        return 'quatre-vingt-'.$this->fallbackNumberToFrench($number - 80);
    }
}
