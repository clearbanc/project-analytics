(function() {
  var chartAreaOptions = {
    bottom: 50,
    top: 50,
    left: 70,
    right: 28,
  };

  function loadScript(url) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');
      script.onload = resolve;
      script.onerror = reject;
      script.src = url;
      document.body.appendChild(script);
    });
  }

  function getCombinedChartData(data) {
    return data
      .sort(([firstDate], [secondDate]) => {
        if (firstDate > secondDate) {
          return 1;
        }
        if (firstDate < secondDate) {
          return -1;
        }

        return 0;
      })
      .reduce((acc, currentValue) => {
        if (!acc.length) {
          return [currentValue];
        }

        const lastValue = acc[acc.length - 1];
        const [lastDate] = lastValue;
        const [currentDate] = currentValue;

        if (moment(currentDate).isSame(moment(lastDate), 'day')) {
          acc.pop();
          acc.push(
            currentValue.map((value, index) =>
              index ? value + lastValue[index] : value,
            ),
          );
        } else {
          acc.push(currentValue);
        }

        return acc;
      }, []);
  }

  function renderCurrentStoryTypeRatioChart() {
    var element = document.getElementById('current-story-type-ratio');
    var chart = new window.google.visualization.PieChart(element);
    var combinedStoryTypeRatios = getCombinedChartData(
      window.Data.StoryTypeRatios,
    );
    var mostRecentRatio =
      combinedStoryTypeRatios[combinedStoryTypeRatios.length - 1];
    var data = new window.google.visualization.arrayToDataTable([
      ['Story Type', 'Current Ratio'],
      ['Features', mostRecentRatio[1]],
      ['Bugs', mostRecentRatio[2]],
      ['Chores', mostRecentRatio[3]],
    ]);

    var options = {
      title: 'Current Story Type Ratio',
      titleTextStyle: { fontSize: 16 },
      chartArea: chartAreaOptions,
      pieHole: 0.4,
    };

    chart.draw(data, options);
  }

  // TODO: Enable once we actually start estimating
  // function renderEstimateRatiosChart() {
  //   var element = document.getElementById('estimate-ratios');
  //   var chart = new window.google.visualization.BarChart(element);
  //   var a = [['Story Estimate', 'Story Count']];

  //   for (var key in window.Data.EstimateChart) {
  //     if (window.Data.EstimateChart.hasOwnProperty(key)) {
  //       a.push([key, window.Data.EstimateChart[key]]);
  //     }
  //   }

  //   var data = new window.google.visualization.arrayToDataTable(a);

  //   var options = {
  //     title: 'Story Estimate Distribution',
  //     titleTextStyle: { fontSize: 16 },
  //     chartArea: chartAreaOptions,
  //     legend: 'none'
  //   };

  //   chart.draw(data, options);
  // }

  function renderStoryTypeRatioChart() {
    var element = document.getElementById('story-type-ratios');
    var chart = new window.google.visualization.AreaChart(element);
    var data = new window.google.visualization.DataTable();

    data.addColumn('date', 'Date');
    data.addColumn('number', 'Features');
    data.addColumn('number', 'Bugs');
    data.addColumn('number', 'Chores');
    data.addRows(getCombinedChartData(window.Data.StoryTypeRatios));

    var options = {
      title: 'Story Type Ratios',
      isStacked: 'percent',
      focusTarget: 'category',
      titleTextStyle: { fontSize: 16 },
      legend: 'none',
      chartArea: chartAreaOptions,
      vAxis: {
        format: '#%',
      },
    };

    chart.draw(data, options);
  }

  function renderMonthlyVelocityChart() {
    var element = document.getElementById('monthly-velocity-chart');
    var chart = new window.google.visualization.ColumnChart(element);
    var data = new window.google.visualization.DataTable();

    data.addColumn('date', 'Date');
    data.addColumn('number', 'Stories');
    data.addColumn('number', 'Points');
    data.addRows(
      getCombinedChartData(window.Data.MonthlyVelocityChart).slice(-12),
    );

    var options = {
      title: 'Monthly Velocity, Last 12 Months',
      titleTextStyle: { fontSize: 16 },
      focusTarget: 'category',
      isStacked: false,
      chartArea: chartAreaOptions,
      trendlines: {
        0: {
          type: 'exponential',
        },
      },
      legend: 'none',
    };

    chart.draw(data, options);
  }

  function renderCycleTimeChart() {
    var element = document.getElementById('cycle-time-chart');
    var data = new window.google.visualization.DataTable();
    var chart = new window.google.visualization.LineChart(element);

    data.addColumn('date', 'Date');
    data.addColumn('number', 'Max');
    data.addColumn('number', 'Average');
    data.addColumn('number', 'Min');
    data.addRows(getCombinedChartData(window.Data.CycleTimeChart).slice(-12));

    var options = {
      title: 'Project Cycle Time in Days, Last 12 Months',
      titleTextStyle: { fontSize: 16 },
      focusTarget: 'category',
      chartArea: chartAreaOptions,
      legend: 'none',
    };

    chart.draw(data, options);
  }

  function renderUnplannedWorkChart() {
    var element = document.getElementById('monthly-unplanned-work-chart');
    var chart = new window.google.visualization.ColumnChart(element);
    var data = new window.google.visualization.DataTable();

    data.addColumn('date', 'Date');
    data.addColumn('number', 'Stories');
    data.addColumn('number', 'Points');
    data.addRows(
      getCombinedChartData(window.Data.MonthlyUnplannedWorkChart).slice(-12),
    );

    var options = {
      title: 'Monthly Unplanned Work, Last 12 Months',
      titleTextStyle: { fontSize: 16 },
      focusTarget: 'category',
      isStacked: false,
      chartArea: chartAreaOptions,
      trendlines: {
        0: {
          type: 'exponential',
        },
      },
      legend: 'none',
    };

    chart.draw(data, options);
  }

  function renderProjectSelect() {
    var element = document.getElementById('project-selector');
    var html =
      '<option>Select Project...</option><option value="all">All</option>';
    window.ClubhouseProjects.forEach(function(project) {
      html +=
        '<option value="' + project.id + '">' + project.name + '</option>';
    });

    element.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function getSelectedProjectID() {
    var element = document.getElementById('project-selector');
    return element.options[element.selectedIndex].value;
  }

  window.onProjectSelect = function() {
    Object.keys(window.Data).forEach(function(key) {
      if (Array.isArray(window.Data[key])) {
        window.Data[key] = [];
      }
    });

    var id = getSelectedProjectID();

    const scriptLoaders =
      id === 'all'
        ? window.ClubhouseProjects.map(function(project) {
            return loadScript('data/project-' + project.id + '.js');
          })
        : [loadScript('data/project-' + id + '.js')];

    Promise.all(scriptLoaders).then(function() {
      renderCharts();
    });
  };

  function renderLastFetched() {
    var element = document.getElementById('last-fetched');
    element.innerHTML =
      'This data was fetched on <strong>' +
      window.Data.LastFetched +
      '</strong>.';
  }

  function hideNoDataForProject() {
    var element = document.getElementById('no-chart-found');
    element.innerHTML = '';
    element.style.display = 'none';

    document.getElementById('chart-container').style.display = 'block';
  }

  function renderCharts() {
    hideNoDataForProject();
    renderLastFetched();

    renderCurrentStoryTypeRatioChart();
    renderStoryTypeRatioChart();
    renderMonthlyVelocityChart();
    // TODO: Enable once we actually start estimating
    // renderEstimateRatiosChart();
    renderCycleTimeChart();
    renderUnplannedWorkChart();
  }

  function initGoogleLibrary() {
    window.google.charts.load('current', { packages: ['corechart', 'line'] });
  }

  function init() {
    initGoogleLibrary();
    renderProjectSelect();
  }

  init();
})();
